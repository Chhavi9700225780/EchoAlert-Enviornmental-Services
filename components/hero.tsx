import { Leaf } from "lucide-react";

export default function Hero() {
  return (
    <div className="text-center py-16 space-y-6">
      <div className="flex items-center justify-center gap-2">
        <Leaf className="h-12 w-12 text-green-600" />
        <h1 className="text-4xl font-bold tracking-tight">EcoAlert's Craft AI</h1>
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Transform your waste into creative treasures. Upload an image of any waste item, 
        and let our AI suggest innovative DIY ideas to give it a second life.
      </p>
    </div>
  );
}