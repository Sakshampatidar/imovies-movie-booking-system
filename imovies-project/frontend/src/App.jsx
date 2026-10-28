import { useEffect, useMemo, useState } from "react";
import { Film, Search, Ticket, UserRound, LogOut, CalendarDays, Clock3, Star, X, ChevronRight, Armchair, CheckCircle2, Menu } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const fallbackMovies = [
  { _id:"demo1", title:"The Last Horizon", description:"A daring crew sets out on a mission that will change their world forever.", genre:["Adventure","Sci-Fi"], duration:138, rating:8.4, language:"English", posterUrl:"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800", showtimes:[] },
  { _id:"demo2", title:"City of Dreams", description:"Two strangers discover that a new beginning can come from the most unexpected place.", genre:["Drama","Romance"], duration:124, rating:7.9, language:"Hindi", posterUrl:"https://images.unsplash.com/photo-1489599849927-2ee91adde2a2?w=800", showtimes:[] },
  { _id:"demo3", title:"Shadow Protocol", description:"A covert agent races against time to stop a dangerous conspiracy.", genre:["Action","Thriller"], duration:132, rating:8.1, language:"Hindi", posterUrl:"https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800", showtimes:[] },
  { _id:"demo4", title:"Ocean of Stars", description:"An animated family adventure about courage, friendship, and finding your way home.", genre:["Animation","Family"], duration:106, rating:8.0, language:"English", posterUrl:"https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800", showtimes:[] }
];
const seatRows = "ABCDEFGHIJ".split("");
const seatNumbers = Array.from({length:10},(_,i)=>i+1);
function App() {
  const [movies,setMovies] = useState([]);
  const [loading,setLoading] = useState(true);
  const [query,setQuery] = useState("");
  const [active,setActive] = useState(null);
  const [show,setShow] = useState(null);
  const [selected,setSelected] = useState([]);
  const [page,setPage] = useState("home");
  const [authMode,setAuthMode] = useState("login");
  const [authOpen,setAuthOpen] = useState(false);
  const [user,setUser] = useState(()=>JSON.parse(localStorage.getItem("imovies_user")||"null"));
  const [token,setToken] = useState(()=>localStorage.getItem("imovies_token")||"");
  const [form,setForm] = useState({name:"",email:"",password:""});
  const [bookings,setBookings] = useState([]);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);

  const api = async (path,options={}) => {
    const response = await fetch(`${API}${path}`, { ...options, headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) }});
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  };
  async function loadMovies() {
    setLoading(true);
    try { const data=await api("/movies"); setMovies(data.length?data:fallbackMovies); }
    catch { setMovies(fallbackMovies); }
    finally { setLoading(false); }
  }
  useEffect(()=>{loadMovies();},[]);
  const filtered = useMemo(()=>movies.filter(m => `${m.title} ${(m.genre||[]).join(" ")}`.toLowerCase().includes(query.toLowerCase())),[movies,query]);
  const openMovie = (movie) => { setActive(movie); setShow(null); setSelected([]); setPage("movie"); window.scrollTo({top:0,behavior:"smooth"}); };
  const notify = (message) => { setNotice(message); setTimeout(()=>setNotice(""),3500); };
  const signOut = () => { localStorage.removeItem("imovies_token"); localStorage.removeItem("imovies_user"); setToken(""); setUser(null); setPage("home"); notify("You have been signed out."); };
  async function submitAuth(e) {
    e.preventDefault(); setBusy(true);
    try {
      const result=await api(`/auth/${authMode}`,{method:"POST",body:JSON.stringify(form)});
      setToken(result.token); setUser(result.user); localStorage.setItem("imovies_token",result.token); localStorage.setItem("imovies_user",JSON.stringify(result.user));
      setAuthOpen(false); setForm({name:"",email:"",password:""}); notify(`Welcome${result.user.name?`, ${result.user.name}`:""}!`);
    } catch(err) { notify(err.message); } finally { setBusy(false); }
  }
  async function loadBookings() {
    if (!token) { setAuthOpen(true); return; }
    try { setBookings(await api("/bookings/mine")); setPage("bookings"); }
    catch(err) { notify(err.message); }
  }
  async function bookSeats() {
    if (!token) { setAuthOpen(true); notify("Please log in before booking."); return; }
    if (!selected.length) { notify("Choose at least one seat."); return; }
    setBusy(true);
    try {
      await api("/bookings",{method:"POST",body:JSON.stringify({movieId:active._id,showtimeId:show._id,seats:selected})});
      notify("Booking confirmed!"); setSelected([]); await loadMovies(); setActive(null); setPage("home");
    } catch(err) { notify(err.message); if(err.message.includes("no longer available")) await loadMovies(); }
    finally { setBusy(false); }
  }
  const availableShows = (active?.showtimes||[]).filter(s=>s.date >= new Date().toISOString().slice(0,10));
  const uniqueDates = [...new Set(availableShows.map(s=>s.date))];
  return <div className="app-shell">
    <header className="navbar">
      <button className="brand" onClick={()=>{setPage("home");setActive(null)}}><span className="brand-mark"><Film size={21}/></span><span>iMovies<span className="brand-dot">.</span></span></button>
      <nav><button className={page==="home"?"nav-link active":"nav-link"} onClick={()=>{setPage("home");setActive(null)}}>Explore</button><button className={page==="bookings"?"nav-link active":"nav-link"} onClick={loadBookings}>My bookings</button></nav>
      <div className="nav-actions"><button className="icon-button search-mobile" onClick={()=>document.getElementById("movie-search")?.focus()} aria-label="Search"><Search/></button>{user?<><span className="user-chip"><span className="avatar">{user.name?.[0]?.toUpperCase()||"U"}</span><span className="user-name">{user.name}</span></span><button className="outline-button" onClick={signOut}><LogOut size={16}/> Sign out</button></>:<button className="primary-button small" onClick={()=>{setAuthMode("login");setAuthOpen(true)}}><UserRound size={16}/> Sign in</button>}</div>
    </header>

    {page==="home" && <main>
      <section className="hero">
        <div className="hero-content"><div className="eyebrow"><span className="live-dot"/> YOUR SEAT IS WAITING</div><h1>Stories worth<br/><span>stepping into.</span></h1><p>Big-screen moments. Unforgettable stories. Book your next movie night in just a few clicks.</p><button className="primary-button" onClick={()=>document.getElementById("movies")?.scrollIntoView({behavior:"smooth"})}>Explore movies <ChevronRight size={18}/></button><div className="hero-meta"><span><Ticket size={15}/> Easy booking</span><span><CheckCircle2 size={15}/> Instant confirmation</span></div></div>
        <div className="hero-art"><div className="hero-glow"/><img src="https://images.unsplash.com/photo-1489599849927-2ee91adde2a2?w=1200" alt="Cinema seats"/><div className="floating-card"><span className="floating-icon"><Ticket size={19}/></span><span><b>Movie night?</b><small>Your front-row feeling starts here.</small></span></div></div>
      </section>
      <section className="content-section" id="movies">
        <div className="section-heading"><div><div className="eyebrow muted">NOW SHOWING</div><h2>Find your next favourite</h2><p>Handpicked stories for every kind of movie lover.</p></div><label className="search-box"><Search size={18}/><input id="movie-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search movies or genres"/></label></div>
        {loading?<div className="loading">Loading movies…</div>:<div className="movie-grid">{filtered.map((movie,i)=><article className="movie-card" key={movie._id} onClick={()=>openMovie(movie)} tabIndex="0" onKeyDown={e=>e.key==="Enter"&&openMovie(movie)}><div className="poster-wrap"><img src={movie.posterUrl||fallbackMovies[i%4].posterUrl} alt={`${movie.title} poster`} onError={e=>e.currentTarget.src=fallbackMovies[i%4].posterUrl}/><span className="rating"><Star size={13} fill="currentColor"/> {movie.rating||"8.0"}</span><button className="poster-cta" onClick={e=>{e.stopPropagation();openMovie(movie)}}>Book tickets <ChevronRight size={15}/></button></div><div className="movie-info"><h3>{movie.title}</h3><p>{(movie.genre||[]).join(" · ")||"Now showing"}</p><div className="movie-meta"><span><Clock3 size={14}/> {movie.duration||120} min</span><span>{movie.language||"Hindi"}</span></div></div></article>)}</div>}
        {!loading&&!filtered.length&&<div className="empty-state">No movies match that search. Try another title or genre.</div>}
      </section>
    </main>}

    {page==="movie"&&active&&<main className="detail-page">
      <button className="back-link" onClick={()=>{setPage("home");setActive(null)}}>← Back to movies</button>
      <section className="movie-detail"><img className="detail-poster" src={active.posterUrl||fallbackMovies[0].posterUrl} alt={active.title} onError={e=>e.currentTarget.src=fallbackMovies[0].posterUrl}/><div className="detail-copy"><div className="eyebrow muted">NOW SHOWING</div><h1>{active.title}</h1><div className="detail-tags"><span><Star size={15} fill="currentColor"/> {active.rating||"8.0"}</span><span>{active.duration||120} minutes</span><span>{active.language||"Hindi"}</span></div><p>{active.description}</p><div className="genre-row">{(active.genre||[]).map(g=><span key={g}>{g}</span>)}</div><h2 className="subheading"><CalendarDays size={19}/> Choose a showtime</h2>
        {availableShows.length?uniqueDates.map(date=><div className="show-date" key={date}><b>{new Date(`${date}T12:00:00`).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</b><div className="show-times">{availableShows.filter(s=>s.date===date).map(s=><button key={s._id} className={show?._id===s._id?"time-button selected":"time-button"} onClick={()=>{setShow(s);setSelected([])}}>{s.time}<small>₹{s.price}</small></button>)}</div></div>):<div className="demo-notice">Demo preview: connect MongoDB and run <code>npm run seed</code> in the backend to load bookable showtimes.</div>}
      </div></section>
      {show&&<section className="seat-section"><div className="section-heading"><div><div className="eyebrow muted">MAKE IT YOURS</div><h2>Select your seats</h2><p>Choose up to 10 seats for {show.time}.</p></div><div className="seat-legend"><span><i/> Available</span><span><i className="selected-legend"/> Selected</span><span><i className="booked-legend"/> Booked</span></div></div><div className="screen"><span>SCREEN THIS WAY</span></div><div className="seat-map">{seatRows.map(row=><div className="seat-row" key={row}><b>{row}</b>{seatNumbers.map(n=>{const seat=`${row}${n}`,isBooked=(show.bookedSeats||[]).includes(seat),isSelected=selected.includes(seat);return <button key={seat} disabled={isBooked} aria-label={`Seat ${seat}`} className={`seat ${isBooked?"booked":isSelected?"selected":""}`} onClick={()=>setSelected(old=>isSelected?old.filter(s=>s!==seat):old.length>=10?old:[...old,seat])}>{n}</button>})}<b>{row}</b></div>)}</div><div className="booking-bar"><div><small>{selected.length} seats selected</small><strong>₹{selected.length*show.price}</strong></div><button className="primary-button" disabled={!selected.length||busy} onClick={bookSeats}>{busy?"Booking…":"Confirm booking"} <ChevronRight size={17}/></button></div></section>}
    </main>}

    {page==="bookings"&&<main className="content-section bookings-page"><div className="eyebrow muted">YOUR MOVIE NIGHTS</div><h1>My bookings</h1><p className="page-intro">All your upcoming cinema plans, in one place.</p>{bookings.length?<div className="booking-list">{bookings.map(b=><article className="booking-card" key={b._id}><div className="booking-icon"><Ticket/></div><div className="booking-details"><h3>{b.movie?.title||"Movie"}</h3><p>{b.showDate} · {b.showTime}</p><p>Seats: {b.seats.join(", ")}</p></div><div className="booking-total"><span>{b.status}</span><strong>₹{b.totalAmount}</strong></div></article>)}</div>:<div className="empty-state"><Ticket size={30}/><h3>No bookings yet</h3><p>Your next great story is just a ticket away.</p><button className="primary-button" onClick={()=>setPage("home")}>Explore movies</button></div>}</main>}

    <footer><button className="brand footer-brand" onClick={()=>{setPage("home");setActive(null)}}><span className="brand-mark"><Film size={18}/></span><span>iMovies<span className="brand-dot">.</span></span></button><p>Made for the love of cinema.</p><small>© {new Date().getFullYear()} iMovies. Demo student project.</small></footer>

    {notice&&<div className="toast" role="status">{notice}</div>}
    {authOpen&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setAuthOpen(false)}><section className="auth-modal"><button className="close-button" onClick={()=>setAuthOpen(false)} aria-label="Close"><X/></button><div className="modal-logo"><Film size={23}/></div><div className="eyebrow muted">WELCOME TO IMOVIES</div><h2>{authMode==="login"?"Welcome back.":"Create your account."}</h2><p>{authMode==="login"?"Sign in to book your next cinema experience.":"Join us and keep your movie nights organised."}</p><form onSubmit={submitAuth}>{authMode==="register"&&<label>Full name<input required minLength="2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label><button className="primary-button auth-submit" disabled={busy}>{busy?"Please wait…":authMode==="login"?"Sign in":"Create account"} <ChevronRight size={17}/></button></form><div className="auth-switch">{authMode==="login"?"New to iMovies?":"Already have an account?"} <button onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Create account":"Sign in"}</button></div></section></div>}
  </div>;
}
export default App;
