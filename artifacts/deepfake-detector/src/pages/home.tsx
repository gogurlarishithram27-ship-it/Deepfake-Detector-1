import { useState, useRef, useEffect, useCallback } from "react";
import { useDetectDeepfake, useListDetections, useGetDetectionStats, getListDetectionsQueryKey, getGetDetectionStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Camera, Download, AlertTriangle, CheckCircle, HelpCircle, Activity, Cpu, Clock, Zap, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function Home() {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"upload" | "webcam">("upload");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const detectMutation = useDetectDeepfake();
  const { data: detections, isLoading: loadingDetections } = useListDetections({ query: { queryKey: getListDetectionsQueryKey() } });
  const { data: stats, isLoading: loadingStats } = useGetDetectionStats({ query: { queryKey: getGetDetectionStatsQueryKey() } });

  // Handle webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (sourceType === "webcam" && !stream) {
      startWebcam();
    } else if (sourceType !== "webcam" && stream) {
      stopWebcam();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sourceType]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImageBase64(dataUrl);
        stopWebcam();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runDetection = () => {
    if (!imageBase64) return;
    
    detectMutation.mutate({
      data: {
        imageBase64,
        source: sourceType
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDetectionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDetectionStatsQueryKey() });
      }
    });
  };

  const downloadReport = () => {
    if (!detectMutation.data) return;
    const reportData = JSON.stringify(detectMutation.data, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `detection-report-${detectMutation.data.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetWorkspace = () => {
    setImageFile(null);
    setImageBase64(null);
    detectMutation.reset();
    if (sourceType === "webcam") {
      startWebcam();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="xl:col-span-2 space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-mono flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Analysis Workspace
              </CardTitle>
              <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as "upload" | "webcam")} className="w-[200px]">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="upload" className="text-xs font-mono">Upload</TabsTrigger>
                  <TabsTrigger value="webcam" className="text-xs font-mono">Webcam</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!imageBase64 ? (
              <div className="h-[500px] rounded-lg border border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/20 relative overflow-hidden">
                {sourceType === "upload" ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">Upload Media for Analysis</h3>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                    <Button variant="secondary" onClick={() => document.getElementById("file-upload")?.click()} className="mt-4">
                      Select File
                    </Button>
                    <input id="file-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileUpload} />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                      <Button size="lg" onClick={handleCapture} className="font-mono shadow-lg">
                        <Camera className="w-4 h-4 mr-2" /> Capture Frame
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-lg overflow-hidden border border-border/50 bg-black aspect-video flex items-center justify-center">
                  <img src={imageBase64} alt="Analysis subject" className="max-w-full max-h-[500px] object-contain" />
                  
                  {detectMutation.data?.regions?.map((region, i) => (
                    <div 
                      key={i}
                      className="absolute border-2 border-red-500/80 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-700 ease-out"
                      style={{
                        left: `${region.x * 100}%`,
                        top: `${region.y * 100}%`,
                        width: `${region.width * 100}%`,
                        height: `${region.height * 100}%`,
                        opacity: region.intensity,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-red-950 text-red-400 text-[10px] font-mono px-2 py-0.5 whitespace-nowrap border border-red-500/30 rounded-sm backdrop-blur-md">
                        {region.label} ({Math.round(region.intensity * 100)}%)
                      </div>
                    </div>
                  ))}

                  {detectMutation.isPending && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                      <p className="font-mono text-sm text-primary animate-pulse">Running multimodal inference...</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={resetWorkspace} disabled={detectMutation.isPending}>
                    Clear Workspace
                  </Button>
                  {!detectMutation.data && (
                    <Button onClick={runDetection} disabled={detectMutation.isPending} className="font-mono min-w-[150px]">
                      {detectMutation.isPending ? "Analyzing..." : "Run Detection"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {detectMutation.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="pb-2 border-b border-border/50">
                <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Detection Verdict</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  {detectMutation.data.label === "FAKE" ? (
                    <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center border border-destructive/50 text-destructive">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  ) : detectMutation.data.label === "REAL" ? (
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 text-green-500">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50 text-yellow-500">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold font-mono tracking-tight">
                      {detectMutation.data.label}
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono">
                      Confidence: {(detectMutation.data.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress 
                  value={detectMutation.data.confidence * 100} 
                  className="h-2 mb-6" 
                  indicatorColor={detectMutation.data.label === 'FAKE' ? 'bg-destructive' : detectMutation.data.label === 'REAL' ? 'bg-green-500' : 'bg-yellow-500'}
                />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium border-b border-border/50 pb-2">Analysis Explanation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {detectMutation.data.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="pb-2 border-b border-border/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Contributing Signals</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs font-mono" onClick={downloadReport}>
                  <Download className="w-3 h-3 mr-2" /> Report
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {detectMutation.data.signals.map((signal, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{signal}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Performance Telemetry</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            {!stats || !detectMutation.data ? (
              <div className="text-center py-8 text-sm text-muted-foreground font-mono">Awaiting inference...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Inference Time</p>
                    <p className="text-xl font-mono font-medium">{detectMutation.data.inferenceMs}ms</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Compute Device</p>
                    <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">{detectMutation.data.device}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">GPU Utilization</span>
                    <span>{Math.round(detectMutation.data.gpuUtilization * 100)}%</span>
                  </div>
                  <Progress value={detectMutation.data.gpuUtilization * 100} className="h-1.5" />
                </div>

                <div className="pt-4 border-t border-border/50 bg-muted/20 -mx-6 -mb-6 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Hardware Acceleration</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Cpu className="w-3 h-3" /> CPU Baseline
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-muted-foreground/30 w-full" />
                      </div>
                      <div className="text-xs font-mono">{detectMutation.data.cpuBaselineMs}ms</div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Zap className="w-3 h-3" /> {detectMutation.data.device}
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${(detectMutation.data.inferenceMs / detectMutation.data.cpuBaselineMs) * 100}%` }} 
                        />
                      </div>
                      <div className="text-xs font-mono text-primary flex items-center justify-between">
                        <span>{detectMutation.data.inferenceMs}ms</span>
                        <span className="bg-primary/20 px-1.5 py-0.5 rounded text-[10px]">{stats.speedupFactor.toFixed(1)}x faster</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur flex-1 flex flex-col h-[calc(100vh-24rem)]">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              Recent Activity
              {stats && <Badge variant="secondary" className="text-[10px]">{stats.totalScans} total scans</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {loadingDetections ? (
                <div className="p-4 space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-md" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : detections?.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No recent detections found.</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {detections?.map((record) => (
                    <div key={record.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors group">
                      {record.thumbnail ? (
                        <img src={record.thumbnail} alt="" className="w-14 h-14 object-cover rounded-md border border-border/50 bg-black/50" />
                      ) : (
                        <div className="w-14 h-14 rounded-md border border-border/50 bg-muted/20 flex items-center justify-center">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] uppercase font-mono px-1.5 py-0 ${
                              record.label === 'FAKE' ? 'border-destructive text-destructive' : 
                              record.label === 'REAL' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
                            }`}
                          >
                            {record.label} ({(record.confidence * 100).toFixed(0)}%)
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {format(new Date(record.createdAt), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {record.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
