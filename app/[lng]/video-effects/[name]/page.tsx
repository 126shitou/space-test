"use server";
import VideoEffectsClient from "./client";
import { videoEffectsData } from "@/lib/config/effects";
import { notFound } from "next/navigation";

export default async function VideoEffectsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const selectedEffect = videoEffectsData.filter((item) => item.id == name)[0];
  if (!selectedEffect) notFound();

  return <VideoEffectsClient selectedEffect={selectedEffect} />;
}
