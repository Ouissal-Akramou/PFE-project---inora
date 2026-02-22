"use client";

import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    fetch("http://localhost:4000/")
      .then(res => res.text())
      .then(data => console.log(data));
  }, []);

  return <h1>Test Backend Connection</h1>;
}