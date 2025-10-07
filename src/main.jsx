import React, { useEffect, useState } from "react";

// CourseTime - Single-file React prototype
// Tailwind CSS classes are used for styling (dark theme).
// Persist data to localStorage under key: "course_time_data"

const STORAGE_KEY = "course_time_data";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [courses, setCourses] = useState(() => loadData());
  const [view, setView] = useState("dashboard"); // dashboard, add, detail
  const [filter, setFilter] = useState("inprogress"); // inprogress, completed, all
  const [activeCourseId, setActiveCourseId] = useState(null);

  useEffect(() => {
    saveData(courses);
  }, [courses]);

  const addCourse = (course) => {
    setCourses((s) => [{ ...course, id: uid(), modules: [], createdAt: Date.now() }, ...s]);
  };

  const updateCourse = (id, patch) => {
    setCourses((s) => s.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addModule = (courseId, module) => {
    setCourses((s) =>
      s.map((c) => (c.id === courseId ? { ...c, modules: [...c.modules, { ...module, id: uid(), seen: false }] } : c))
    );
  };

  const toggleModuleSeen = (courseId, moduleId) => {
    setCourses((s) =>
      s.map((c) => {
        if (c.id !== courseId) return c;
        const modules = c.modules.map((m) => (m.id === moduleId ? { ...m, seen: !m.seen } : m));
        const allSeen = modules.length > 0 && modules.every((m) => m.seen);
        return { ...c, modules, status: allSeen ? "completed" : c.status || "inprogress" };
      })
    );
  };

  const removeCourse = (id) => {
    if (!confirm("آیا از حذف دوره مطمئن هستی؟")) return;
    setCourses((s) => s.filter((c) => c.id !== id));
  };

  const filteredCourses = courses.filter((c) => {
    if (filter === "all") return true;
    if (filter === "inprogress") return (c.status || (c.modules && c.modules.some((m) => !m.seen))) && (c.status !== "completed");
    if (filter === "completed") return c.status === "completed" || (c.modules && c.modules.length > 0 && c.modules.every((m) => m.seen));
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Course Time</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setView("add")}
              className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500"
            >
              ➕ افزودن دوره
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setCourses([]);
              }}
              className="px-3 py-2 border border-gray-700 rounded-md"
              title="پاک کردن همه داده‌ها"
            >
              پاک‌سازی
            </button>
          </div>
        </header>

        {view === "dashboard" && (
          <>
            <nav className="flex gap-2 mb-4">
              <TabButton active={filter === "inprogress"} onClick={() => setFilter("inprogress")}>در حال مشاهده</TabButton>
              <TabButton active={filter === "completed"} onClick={() => setFilter("completed")}>تمام‌شده</TabButton>
              <TabButton active={filter === "all"} onClick={() => setFilter("all")}>همه</TabButton>
            </nav>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCourses.length === 0 && (
                <div className="p-6 rounded-lg border border-gray-800 text-center text-gray-400">هیچ دوره‌ای پیدا نشد — یکی اضافه کن!</div>
              )}

              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onOpen={() => {
                    setActiveCourseId(course.id);
                    setView("detail");
                  }}
                  onToggleModule={toggleModuleSeen}
                  onDelete={() => removeCourse(course.id)}
                />
              ))}
            </section>
          </>
        )}

        {view === "add" && (
          <div className="mt-4">
            <AddCourseForm
              onCancel={() => setView("dashboard")}
              onSave={(c) => {
                addCourse({ ...c, status: "inprogress" });
                setView("dashboard");
              }}
            />
          </div>
        )}

        {view === "detail" && activeCourseId && (
          <CourseDetail
            key={activeCourseId}
            course={courses.find((c) => c.id === activeCourseId)}
            onBack={() => setView("dashboard")}
            onAddModule={(m) => addModule(activeCourseId, m)}
            onToggle={(moduleId) => toggleModuleSeen(activeCourseId, moduleId)}
            onUpdate={(patch) => updateCourse(activeCourseId, patch)}
          />
        )}

        <footer className="mt-8 text-sm text-gray-500 text-center">ذخیره‌شده در مرورگر شما (localStorage)</footer>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md ${active ? "bg-gray-800" : "border border-gray-800"}`}
    >
      {children}
    </button>
  );
}

function CourseCard({ course, onOpen, onDelete }) {
  const total = course.modules ? course.modules.length : 0;
  const seen = course.modules ? course.modules.filter((m) => m.seen).length : 0;
  const percent = total === 0 ? 0 : Math.round((seen / total) * 100);

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex gap-4">
      <div className="w-20 h-20 rounded-md bg-gray-700 flex-shrink-0 overflow-hidden">
        {course.image ? (
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">عکس</div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{course.title}</h3>
        <p className="text-sm text-gray-400">{course.instructor || "مدرس نامشخص"} • {course.platform || "پلتفرم"}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-300">{seen}/{total} فصل</div>
          <div className="text-sm">{percent}%</div>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={onOpen} className="px-3 py-1 rounded-md bg-indigo-600">ادامه</button>
          <button onClick={onDelete} className="px-3 py-1 rounded-md border border-red-600 text-red-400">حذف</button>
        </div>
      </div>
    </div>
  );
}

function AddCourseForm({ onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [instructor, setInstructor] = useState("");
  const [platform, setPlatform] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const pickImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("عنوان را وارد کن");
    onSave({ title, instructor, platform, description, image });
  };

  return (
    <form onSubmit={submit} className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">افزودن دوره جدید</h2>
      <div className="grid grid-cols-1 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان دوره" className="p-3 rounded bg-gray-700" />
        <input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="نام مدرس" className="p-3 rounded bg-gray-700" />
        <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="پلتفرم" className="p-3 rounded bg-gray-700" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات" className="p-3 rounded bg-gray-700" rows={4} />

        <div className="flex items-center gap-3">
          <label className="px-3 py-2 bg-gray-700 rounded cursor-pointer border border-dashed">انتخاب عکس<input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} className="hidden" /></label>
          {image && <div className="w-20 h-20 rounded overflow-hidden"><img src={image} alt="cover" className="w-full h-full object-cover" /></div>}
        </div>

        <div className="flex gap-2 mt-4">
          <button type="submit" className="px-4 py-2 bg-indigo-600 rounded">ذخیره</button>
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">انصراف</button>
        </div>
      </div>
    </form>
  );
}

function CourseDetail({ course, onBack, onAddModule, onToggle, onUpdate }) {
  const [title, setTitle] = useState(course.title);
  const [instructor, setInstructor] = useState(course.instructor || "");
  const [platform, setPlatform] = useState(course.platform || "");
  const [description, setDescription] = useState(course.description || "");

  useEffect(() => {
    setTitle(course.title);
    setInstructor(course.instructor || "");
    setPlatform(course.platform || "");
    setDescription(course.description || "");
  }, [course]);

  const total = course.modules ? course.modules.length : 0;
  const seen = course.modules ? course.modules.filter((m) => m.seen).length : 0;
  const percent = total === 0 ? 0 : Math.round((seen / total) * 100);

  const saveMeta = () => onUpdate({ title, instructor, platform, description });

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-6">
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="px-3 py-2 border rounded">بازگشت</button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 bg-gray-700 rounded overflow-hidden">
              {course.image ? <img src={course.image} className="w-full h-full object-cover" alt="cover" /> : <div className="p-4 text-gray-400">عکس</div>}
            </div>
            <div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-gray-700 rounded" />
              <div className="text-sm text-gray-400">{instructor} • {platform}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-400">{percent}%</div>
              <div className="text-xs text-gray-500">{seen}/{total} فصل</div>
            </div>
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mt-4 p-3 bg-gray-700 rounded" />

          <div className="mt-4 flex gap-2">
            <button onClick={saveMeta} className="px-3 py-2 bg-indigo-600 rounded">ذخیره مشخصات</button>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">سرفصل‌ها</h4>
            <ModuleAdder onAdd={(m) => onAddModule(m)} />

            <div className="mt-3 space-y-2">
              {course.modules && course.modules.length === 0 && <div className="text-gray-400">هنوز سرفصلی اضافه نکردی.</div>}
              {course.modules && course.modules.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-gray-700 p-3 rounded">
                  <div>
                    <input id={`chk-${m.id}`} type="checkbox" checked={m.seen} onChange={() => onToggle(m.id)} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{m.title}</div>
                    <div className="text-sm text-gray-400">{m.notes}</div>
                  </div>
                  <div className="text-sm text-gray-400">{m.duration || "-"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleAdder({ onAdd }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("عنوان فصل را وارد کن");
    onAdd({ title, notes, duration });
    setTitle("");
    setNotes("");
    setDuration("");
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان فصل" className="p-2 bg-gray-700 rounded col-span-1 sm:col-span-2" />
      <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="مدت (مثلا 12:34)" className="p-2 bg-gray-700 rounded" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="توضیح یا لینک" className="p-2 bg-gray-700 rounded sm:col-span-3" rows={2} />
      <div className="sm:col-span-3">
        <button type="submit" className="px-3 py-2 bg-green-600 rounded">افزودن فصل</button>
      </div>
    </form>
  );
}
