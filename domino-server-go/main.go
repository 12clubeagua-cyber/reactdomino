package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Message struct {
	Type    string          `json:"type"`
	RoomID  string          `json:"roomId"`
	Payload json.RawMessage `json:"payload"`
}

type Client struct {
	Conn     *websocket.Conn
	Name     string
	Index    int
	Send     chan []byte
}

type Room struct {
	ID      string
	Clients map[*Client]bool
	Mutex   sync.Mutex
}

type Hub struct {
	Rooms map[string]*Room
	Mutex sync.Mutex
}

func (h *Hub) GetOrCreateRoom(id string) *Room {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()
	if room, ok := h.Rooms[id]; ok {
		return room
	}
	room := &Room{
		ID:      id,
		Clients: make(map[*Client]bool),
	}
	h.Rooms[id] = room
	return room
}

func handleWebSocket(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	
	client := &Client{Conn: conn, Send: make(chan []byte, 256)}
	
	defer func() {
		conn.Close()
	}()

	for {
		_, msgData, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var msg map[string]interface{}
		json.Unmarshal(msgData, &msg)
		
		roomId, _ := msg["roomId"].(string)
		msgType, _ := msg["type"].(string)
		
		room := hub.GetOrCreateRoom(roomId)
		room.Mutex.Lock()
		
		if msgType == "create_room" || msgType == "join_room" {
			client.Index = len(room.Clients)
			room.Clients[client] = true
			
			// Notifica todos na sala
			players := []string{}
			for c := range room.Clients {
				players = append(players, c.Name)
			}
			
			joinNotification, _ := json.Marshal(map[string]interface{}{
				"type": "player_joined",
				"playerName": "Novo Jogador",
				"players": players,
			})
			for c := range room.Clients {
				c.Conn.WriteMessage(websocket.TextMessage, joinNotification)
			}
		} else {
			// Broadcast genérico para qualquer outra mensagem (game_start, state_update, etc)
			for c := range room.Clients {
				if c != client {
					c.Conn.WriteMessage(websocket.TextMessage, msgData)
				}
			}
		}
		room.Mutex.Unlock()
	}
}

func main() {
	hub := &Hub{Rooms: make(map[string]*Room)}
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(hub, w, r)
	})
	fmt.Println("Hardcore Go Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
