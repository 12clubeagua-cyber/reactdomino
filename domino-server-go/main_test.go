package main

import (
	"testing"
)

func TestRoomManagement(t *testing.T) {
	hub := &Hub{Rooms: make(map[string]*Room)}
	
	// Testa criacao de sala
	room := hub.GetOrCreateRoom("TEST1")
	if room.ID != "TEST1" {
		t.Errorf("Esperado sala TEST1, obtido %s", room.ID)
	}

	// Testa recuperacao de sala existente
	room2 := hub.GetOrCreateRoom("TEST1")
	if room != room2 {
		t.Error("Hub deveria retornar a mesma instancia de sala")
	}
}
