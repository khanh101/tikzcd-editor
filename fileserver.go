package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", http.StripPrefix("/", fs))
	log.Println("Server is up: http://0.0.0.0:3000")
	log.Fatal(http.ListenAndServe("0.0.0.0:3000", nil))
}
