import { useEffect, useState } from 'react'
import './App.css'
import { api } from './api'

function App() {
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('123')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Type-safe GET request
    // 'data' is automatically inferred as { message: string }
    api.get('/api/hello').then((data) => {
      setMessage(data.message)
    })
  }, [])

  const fetchUser = async () => {
    // Type-safe GET request with path parameters
    // 'data' is automatically inferred with correct structure
    const data = await api.get('/api/user/:id', {
      params: { id: userId }
    })
    setUserData(data)
  }

  const sendEcho = async () => {
    // Type-safe POST request
    // 'json' payload is checked if schema is defined
    const data = await api.post('/api/echo', {
      json: { text: 'Hello World!' }
    })
    alert(`Server echoed: ${data.echoed}`)
  }

  return (
    <div className="App">
      <h1>hono-typed-rest React Example</h1>
      
      <div className="card">
        <h3>Basic GET</h3>
        <p>Message from server: {message}</p>
      </div>

      <div className="card">
        <h3>Path Parameters</h3>
        <input 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
          placeholder="User ID"
        />
        <button onClick={fetchUser}>Fetch User</button>
        {userData && (
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        )}
      </div>

      <div className="card">
        <h3>POST Request</h3>
        <button onClick={sendEcho}>Send Echo</button>
      </div>
    </div>
  )
}

export default App
