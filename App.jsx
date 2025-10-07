import React, { useState } from 'react'

export default function App() {
  const [courses, setCourses] = useState([])
  const [title, setTitle] = useState('')

  const addCourse = () => {
    if (!title.trim()) return
    setCourses([...courses, { title, done: false }])
    setTitle('')
  }

  const toggleCourse = (index) => {
    const updated = [...courses]
    updated[index].done = !updated[index].done
    setCourses(updated)
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Course Time</h1>
      <div className="max-w-md mx-auto space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان دوره جدید..."
          className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-700 focus:outline-none"
        />
        <button
          onClick={addCourse}
          className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          افزودن دوره
        </button>

        <div className="mt-6 space-y-2">
          {courses.map((c, i) => (
            <div
              key={i}
              onClick={() => toggleCourse(i)}
              className={`p-3 rounded-lg cursor-pointer border border-neutral-700 ${
                c.done ? 'bg-green-800 line-through text-gray-400' : 'bg-neutral-800'
              }`}
            >
              {c.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
