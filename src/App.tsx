import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import './app.css';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

  }, []);

  function createTodo() {
    const content = window.prompt("Personal notes content");
    if (content !== null && content.trim() !== "") {
      client.models.Todo.create({ content });
    }
  }

  function editTodo(todo: Schema["Todo"]["type"]) {
    const currentContent = todo.content ?? "";
    const updatedContent = window.prompt("Edit your note", currentContent);
    if (updatedContent !== null && updatedContent.trim() !== "" && updatedContent !== todo.content) {
      client.models.Todo.update({
        id: todo.id,
        content: updatedContent.trim()
      });
    }
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main className="main-container">
      <div className="app-header">
        <h1 className="title">{user?.signInDetails?.loginId}'s notes</h1>
        <button className="new-button" onClick={createTodo}>+ New Note</button>
      </div>

      <ul className="notes-list">
        {todos.map((todo) => (
          <li key={todo.id} className="note-card">
            <span className="note-text">{todo.content}</span>
            <div className="note-actions">
              <button className="note-btn" onClick={() => editTodo(todo)}>✏️</button>
              <button className="note-btn" onClick={() => deleteTodo(todo.id)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="footer">
        <button className="signout-button" onClick={signOut}>Sign Out</button>
      </div>
    </main>
  );
}

export default App;
