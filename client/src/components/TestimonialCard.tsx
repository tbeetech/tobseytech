import React from "react";

type Props = {
  quote: string;
  author: string;
};

export default function TestimonialCard({ quote, author }: Props) {
  return (
    <div className="p-6 border border-gray-800 rounded-lg bg-black/60">
      <p className="text-gray-300">"{quote}"</p>
      <p className="mt-4 text-yellow-400">- {author}</p>
    </div>
  );
}
