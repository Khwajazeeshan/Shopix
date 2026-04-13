"use client"
import dynamic from "next/dynamic";
import Loader from "../components/Loader";

const Homepage = dynamic(() => import("../components/homepage/page"), {
  ssr: false,
  loading: () => <Loader />
});

export default function Home() {
  return <Homepage />;
}