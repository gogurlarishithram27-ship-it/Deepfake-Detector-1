import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Cpu, Network, Database } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-mono tracking-tight">About Deepfake Detector PRO</h1>
        <p className="text-muted-foreground leading-relaxed text-lg">
          A forensic instrument designed for trust & safety teams, journalists, and analysts to triage suspicious imagery using state-of-the-art multimodal vision models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2 text-base">
              <Cpu className="w-4 h-4 text-primary" /> Hardware Acceleration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              Inference is powered by high-performance cloud GPUs optimized with AMD ROCm technology, delivering significant speedups over CPU baselines.
            </p>
            <p>
              This allows for near real-time analysis of high-resolution imagery without sacrificing model complexity.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2 text-base">
              <Network className="w-4 h-4 text-primary" /> Multimodal Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              Utilizing advanced vision-language models (powered by Anthropic technology) to not just classify images, but understand and explain the artifacts found.
            </p>
            <p>
              The system outputs human-readable explanations alongside raw confidence scores.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-primary" /> Grad-CAM Region Highlighting
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              When a manipulation is detected, the model uses spatial attention techniques to generate a heatmap over the original image. This highlights exactly which regions contributed most strongly to the model's verdict (e.g., blending artifacts around the eyes or anomalous lighting on the jawline), providing interpretable evidence for forensic review.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="pt-8 border-t border-border/50">
        <div className="flex items-center gap-4 text-sm text-muted-foreground/60 font-mono">
          <Database className="w-4 h-4" />
          <p>System v1.0.0 · Data retained for active session only</p>
        </div>
      </div>
    </div>
  );
}
