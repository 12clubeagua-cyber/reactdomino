package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
)

// --- ESTRUTURAS DE DADOS ---

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Message struct {
	Type    string          `json:"type"`
	RoomID  string          `json:"roomId"`
	Payload json.RawMessage `json:"payload"`
}

type Client struct {
	Conn  *websocket.Conn
	Name  string
	Index int
}

type Room struct {
	ID      string
	Clients map[*Client]bool
	State   json.RawMessage // Estado serializado para persistência
	Mutex   sync.Mutex
}

type Hub struct {
	Rooms map[string]*Room
	DB    *sql.DB
	Mutex sync.Mutex
}

// --- PERSISTÊNCIA (FASE 4) ---

func initDB() *sql.DB {
	db, err := sql.Open("sqlite3", "./domino.db")
	if err != nil {
		log.Fatal(err)
	}
	sqlStmt := `
	CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, state TEXT, updated_at DATETIME);
	`
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Fatal(err)
	}
	return db
}

func (h *Hub) SaveRoom(room *Room) {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()
	_, err := h.DB.Exec("INSERT OR REPLACE INTO rooms (id, state, updated_at) VALUES (?, ?, ?)", 
		room.ID, string(room.State), time.Now())
	if err != nil {
		log.Println("Erro ao salvar sala:", err)
	}
}

// --- CORE LOGIC ---

func (h *Hub) GetOrCreateRoom(id string) *Room {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()
	if room, ok := h.Rooms[id]; ok {
		return room
	}
	
	// Tenta recuperar do DB se não estiver em memória
	var savedState string
	err := h.DB.QueryRow("SELECT state FROM rooms WHERE id = ?", id).Scan(&savedState)
	
	room := &Room{
		ID:      id,
		Clients: make(map[*Client]bool),
	}
	if err == nil {
		room.State = json.RawMessage(savedState)
	}
	
	h.Rooms[id] = room
	return room
}

func handleWebSocket(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	client := &Client{Conn: conn}
	
	defer func() {
		conn.Close()
	}()

	for {
		_, msgData, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var raw map[string]interface{}
		json.Unmarshal(msgData, &raw)
		
		roomId, _ := raw["roomId"].(string)
		msgType, _ := raw["type"].(string)
		
		if roomId == "" { continue }

		room := hub.GetOrCreateRoom(roomId)
		room.Mutex.Lock()
		
		switch msgType {
		case "create_room", "join_room":
			client.Index = len(room.Clients)
			room.Clients[client] = true
			
			players := []string{}
			for c := range room.Clients {
				players = append(players, c.Name)
			}
			
			res, _ := json.Marshal(map[string]interface{}{
				"type": "player_joined",
				"players": players,
				"recovered_state": room.State,
			})
			for c := range room.Clients {
				c.Conn.WriteMessage(websocket.TextMessage, res)
			}

		case "state_update":
			// Atualiza o estado na memória e no DB
			room.State = raw["payload"].(json.RawMessage)
			hub.SaveRoom(room)
			fallthrough // Faz o broadcast normal

		default:
			for c := range room.Clients {
				if c != client {
					c.Conn.WriteMessage(websocket.TextMessage, msgData)
				}
			}
		}
		room.Mutex.Unlock()
	}
}

// --- MAIN (FASE 5: HEALTH) ---

func main() {
	db := initDB()
	hub := &Hub{
		Rooms: make(map[string]*Room),
		DB:    db,
	}

	// Endpoint de Health Check
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "OK - Active Rooms: %d", len(hub.Rooms))
	})

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(hub, w, r)
	})

	fmt.Println("Resilient Domino Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
