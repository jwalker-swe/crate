import Image from "next/image";
import './globals.css';
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div className={`
      content-container
      w-[1200px] h-screen
      mx-auto
    `}>
      <NavBar />
    </div>
  )
}