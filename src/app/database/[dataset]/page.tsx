import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DATASETS, getDataset, isDatasetId } from "@/lib/datasets";
import { DatasetView } from "./DatasetView";

export function generateStaticParams() {
  return DATASETS.map((d) => ({ dataset: d.id }));
}

export async function generateMetadata({ params }: PageProps<"/database/[dataset]">): Promise<Metadata> {
  const { dataset } = await params;
  return { title: isDatasetId(dataset) ? `${getDataset(dataset).name} · Database` : "Dataset tidak ditemukan" };
}

export default async function DatasetPage({ params }: PageProps<"/database/[dataset]">) {
  const { dataset } = await params;
  if (!isDatasetId(dataset)) notFound();
  return <DatasetView key={dataset} dataset={dataset} />;
}
