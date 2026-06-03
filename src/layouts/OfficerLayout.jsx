import Navbar from "../components/common/Navbar"
import { Outlet } from "react-router-dom"

function MainLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <Navbar />

      <main>
        <Outlet />
      </main>

    </div>
  )
}

export default MainLayout