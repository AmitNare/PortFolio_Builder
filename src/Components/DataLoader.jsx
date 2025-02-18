import React from "react"; 
import '../style.css'

export default function DataLoader() {
  return (
    <div className="w-full h-full flex justify-center items-center border-2">
      <div class="typewriter">
        <div class="slide ">
          <i></i>
        </div>
        <div class="paper"></div>
        <div class="keyboard"></div>
      </div>
    </div>
  );
}
