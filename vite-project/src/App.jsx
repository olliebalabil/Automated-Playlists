import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SpotifyWebApi from "spotify-web-api-node"
import axios from "axios"

function App() {
  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const d = new Date();
let name = month[d.getMonth()];
  const [token, setToken] = useState('')
  const [tracks, setTracks] = useState([])
  const CLIENT_ID = '6439b128698840e7b670c31bbfb2a261'
  const REDIRECT_URI = 'https://automate-playlists.onrender.com/'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'
  const SCOPE = 'user-top-read playlist-modify-public playlist-modify-private user-read-private user-read-email'

  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI
  })
  useEffect(() => {
    console.log(name)
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(el => el.startsWith("access_token")).split("=")[1]
      window.location.hash = ''
      window.localStorage.setItem("token", token)
    }
    setToken(token)

  }, [])
  useEffect(() => {
    if (token) {
      spotifyApi.setAccessToken(localStorage.getItem("token"))

      axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((response) => {
          window.localStorage.setItem("user_id", response.data.id)
        })
        .catch((err) => {
          console.error(err.message)
        })
    }
  }, [token])

  const addPlaylist = () => {
    let playlistId = ""
    spotifyApi.createPlaylist(name, { "description": `My top 50 songs from ${name}`, "public": false })
      .then(function (response) {
        console.log("created playlist")
        playlistId = response.body.id;

        axios.get("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
          .then(function (response) {
            spotifyApi.addTracksToPlaylist(playlistId,response.data.items.map(el=>el.uri))
          })
          .catch(function (err) {
            console.error({ "error": err });
          });
          
      })

  }
  return (
    <>
      <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login to Spotify</a>
      <button onClick={addPlaylist}>Add Playlist</button>


    </>
  )
}

export default App
