/**
 * Seat Layout Manager - Admin Visual Editor
 * Interactive tool to place and configure seats on a base map
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { SEAT_LAYOUT_CONSTANTS, calculateSeatDimensions } from '../../components/shuttle/seatCoordinateSystem';
import { 
  Plus, Save, Trash2, Settings, Download, Upload, 
  Layers, CheckCircle2, AlertCircle, History, 
  Image as ImageIcon, ZoomIn, ZoomOut, MousePointer2,
  Undo, Redo, Grid3X3, Palette, List, Eye
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { seatLayoutService } from '../services/seatLayoutService';
import { SeatLayout, Seat, SeatCategory } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import './SeatLayoutEditor.css';

// Constants
const CONSTANTS = {
  HISTORY_MAX_LENGTH: 50,
  SEAT_RADIUS: 2, // 2% radius for overlap detection
  DEFAULT_BASE_WIDTH: 800,
  DEFAULT_BASE_HEIGHT: 600,
  DEFAULT_GLOBAL_SCALE: 1.0,
  SEAT_BASE_SIZE: 32, // px
  MIN_GRID_SIZE: 1,
  MAX_GRID_SIZE: 20,
  DEFAULT_GRID_SIZE: 5,
  MIN_DIMENSION: 0.5,
  MAX_LENGTH: 2.0,
  MIN_HEIGHT: 0.3,
  MAX_HEIGHT: 1.5,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2.0,
  ZOOM_STEP: 0.1
} as const;

// Types
interface DeleteConfirmationState {
  open: boolean;
  layoutId: string | null;
  layoutName: string;
}

const SeatLayoutEditor: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const layoutId = searchParams.get('id');

  const [layout, setLayout] = useState<Partial<SeatLayout>>({
    name: 'Untitled Layout',
    status: 'draft',
    base_width: CONSTANTS.DEFAULT_BASE_WIDTH,
    base_height: CONSTANTS.DEFAULT_BASE_HEIGHT,
    global_scale: CONSTANTS.DEFAULT_GLOBAL_SCALE,
    seats: []
  });
  const [layouts, setLayouts] = useState<SeatLayout[]>([]);
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(CONSTANTS.DEFAULT_GRID_SIZE);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    open: false,
    layoutId: null,
    layoutName: ''
  });
  const [history, setHistory] = useState<Seat[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load categories and layouts
  useEffect(() => {
    fetchCategories();
    fetchLayouts();
  }, []);

  // Load specific layout if ID is in URL
  useEffect(() => {
    if (layoutId) {
      loadLayout(layoutId);
    } else {
      // Reset to new layout if no ID
      setLayout({
        name: 'Untitled Layout',
        status: 'draft',
        base_width: CONSTANTS.DEFAULT_BASE_WIDTH,
        base_height: CONSTANTS.DEFAULT_BASE_HEIGHT,
        global_scale: CONSTANTS.DEFAULT_GLOBAL_SCALE,
        seats: []
      });
    }
  }, [layoutId]);

  // Monitor canvas container size for responsive scaling (sync with user display)
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    
    const updateContainerWidth = () => {
      if (canvasContainerRef.current) {
        setContainerWidth(canvasContainerRef.current.offsetWidth);
      }
    };

    const observer = new ResizeObserver(updateContainerWidth);
    observer.observe(canvasContainerRef.current);
    updateContainerWidth();

    return () => observer.disconnect();
  }, [layout]);

  // Debug: Log layout changes, especially base_map_url
  useEffect(() => {
    console.log('[SeatLayoutEditor] Layout updated:', {
      name: layout.name,
      base_map_url: layout.base_map_url,
      numSeats: layout.seats?.length || 0,
      status: layout.status
    });
  }, [layout.base_map_url]);

  const fetchLayouts = async () => {
    setIsLoadingLayouts(true);
    const { data } = await seatLayoutService.getLayouts();
    if (data) setLayouts(data);
    setIsLoadingLayouts(false);
  };

  const loadLayout = async (id: string) => {
    const toastId = toast.loading('Loading layout...');
    const { data, error } = await seatLayoutService.getLayoutById(id);
    if (error) {
      toast.error('Failed to load layout', { id: toastId });
    } else if (data) {
      setLayout(data);
      if (data.seats) {
        setHistory([JSON.parse(JSON.stringify(data.seats))]);
        setHistoryIndex(0);
      }
      toast.success('Layout loaded', { id: toastId });
    }
  };

  const handleSelectLayout = (id: string) => {
    setSearchParams({ id });
  };

  const handleDeleteLayoutClick = (layoutId: string, layoutName: string) => {
    setDeleteConfirmation({ open: true, layoutId, layoutName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.layoutId) return;

    const toastId = toast.loading('Deleting layout...');
    try {
      const { error } = await seatLayoutService.deleteLayout(deleteConfirmation.layoutId);
      if (error) {
        toast.error('Failed to delete layout', { id: toastId });
      } else {
        toast.success('Layout deleted successfully', { id: toastId });
        
        // Refresh layouts list
        await fetchLayouts();
        
        // If deleted layout is currently selected, reset to new
        if (layout.id === deleteConfirmation.layoutId) {
          handleCreateNew();
        }
      }
    } catch (err) {
      toast.error('Error deleting layout', { id: toastId });
    } finally {
      setDeleteConfirmation({ open: false, layoutId: null, layoutName: '' });
    }
  };

  const handleCreateNew = () => {
    setSearchParams({});
  };

  // Add current state to history with size limit
  const addToHistory = useCallback((newSeats: Seat[]) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newSeats)));
      if (newHistory.length > CONSTANTS.HISTORY_MAX_LENGTH) {
        newHistory.shift(); // Limit history
      }
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev > 0) {
        const prevIndex = prev - 1;
        setLayout(prevLayout => ({
          ...prevLayout,
          seats: JSON.parse(JSON.stringify(history[prevIndex]))
        }));
        return prevIndex;
      }
      return prev;
    });
  }, [history]);

  const handleRedo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev < history.length - 1) {
        const nextIndex = prev + 1;
        setLayout(prevLayout => ({
          ...prevLayout,
          seats: JSON.parse(JSON.stringify(history[nextIndex]))
        }));
        return nextIndex;
      }
      return prev;
    });
  }, [history]);

  const fetchCategories = async () => {
    const { data } = await seatLayoutService.getCategories();
    if (data) setCategories(data);
  };

  const handleSeedDefaultCategories = async () => {
    const defaults = [
      { name: 'VIP', color: '#f59e0b', base_price_multiplier: 2.0 },
      { name: 'Regular', color: '#3b82f6', base_price_multiplier: 1.0 },
      { name: 'Economy', color: '#10b981', base_price_multiplier: 0.8 }
    ];

    const toastId = toast.loading('Seeding default categories...');
    try {
      for (const cat of defaults) {
        await seatLayoutService.createCategory(cat);
      }
      await fetchCategories();
      toast.success('Default categories added successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to seed categories', { id: toastId });
    }
  };

  const handleAddSeat = useCallback(() => {
    if (categories.length === 0) {
      toast.error('Cannot add seat: No categories available.');
      return;
    }

    const newSeat: Seat = {
      id: `new-${Date.now()}`,
      layout_id: layout.id || '',
      seat_number: `${(layout.seats?.length || 0) + 1}`,
      category_id: categories[0]?.id || '',
      x_pos: 50,
      y_pos: 50,
      status: 'available',
      seat_length: 1.0,
      seat_width: 1.0,
      seat_height: 1.0
    };
    
    const newSeats = [...(layout.seats || []), newSeat];
    setLayout(prev => ({
      ...prev,
      seats: newSeats
    }));
    addToHistory(newSeats);
    setSelectedSeatIds([newSeat.id]);
  }, [layout, categories, addToHistory]);

  const handleSeatDrag = useCallback((id: string, info: any) => {
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Account for zoom: divide by current zoom level
    // Because canvas is scaled via transform: scale(zoom), we need to normalize
    let x = ((info.point.x - canvasRect.left) / (canvasRect.width * zoom)) * 100;
    let y = ((info.point.y - canvasRect.top) / (canvasRect.height * zoom)) * 100;

    // Snap to grid
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    // Constrain to 0-100
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    const newSeats = layout.seats?.map(s => s.id === id ? { ...s, x_pos: constrainedX, y_pos: constrainedY } : s) || [];
    setLayout(prev => ({
      ...prev,
      seats: newSeats
    }));
  }, [layout.seats, snapToGrid, gridSize, zoom]);

  const handleDragStart = useCallback((id: string) => {
    setDraggedSeatId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedSeatId(null);
    if (layout.seats) addToHistory(layout.seats);
  }, [layout.seats, addToHistory]);

  const handleUpdateSeat = useCallback((ids: string[], updates: Partial<Seat>) => {
    const newSeats = layout.seats?.map(s => ids.includes(s.id) ? { ...s, ...updates } : s) || [];
    setLayout(prev => ({
      ...prev,
      seats: newSeats
    }));
    addToHistory(newSeats);
  }, [layout.seats, addToHistory]);

  const handleDeleteSeat = useCallback((ids: string[]) => {
    const newSeats = layout.seats?.filter(s => !ids.includes(s.id)) || [];
    setLayout(prev => ({
      ...prev,
      seats: newSeats
    }));
    addToHistory(newSeats);
    setSelectedSeatIds([]);
  }, [layout.seats, addToHistory]);

  const handleSeatClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      setSelectedSeatIds(prev => 
        prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
    } else {
      setSelectedSeatIds([id]);
    }
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedSeatIds([]);
  }, []);

  // OPTIMIZATION: O(n) overlap detection instead of O(n²) nested loops
  const checkSeatsOverlap = (seats: Seat[]): boolean => {
    const occupied = new Set<string>();
    
    for (const seat of seats) {
      // Create grid key based on position and radius
      const gridKey = `${Math.round(seat.x_pos / CONSTANTS.SEAT_RADIUS)},${Math.round(seat.y_pos / CONSTANTS.SEAT_RADIUS)}`;
      
      if (occupied.has(gridKey)) {
        return true; // Overlap detected
      }
      
      occupied.add(gridKey);
    }
    
    return false; // No overlaps
  };

  const handleSaveLayout = async () => {
    if (isSaving) return;
    
    // Check if categories are loaded
    if (categories.length === 0) {
      toast.error('Seat categories not loaded. Please refresh or create categories first.');
      return;
    }

    const saveToastId = toast.loading('Saving layout...');
    const totalStartTime = performance.now();
    setIsSaving(true);
    
    try {
      if (!layout.name?.trim()) {
        toast.error('Please enter a layout name', { id: saveToastId });
        return;
      }
      
      // Validate seats
      const invalidSeats = layout.seats?.filter(s => !s.category_id || s.category_id === '');
      if (invalidSeats && invalidSeats.length > 0) {
        toast.error(`Found ${invalidSeats.length} seats without a valid category.`, { id: saveToastId });
        return;
      }

      // Optimized: O(n) overlap detection using hash set (instead of O(n²) nested loops)
      const hasConflicts = checkSeatsOverlap(layout.seats || []);
      if (hasConflicts) {
        toast.warning('Warning: Some seats are overlapping!');
      }

      let savedLayoutData;
      
      // Prepare layout payload
      const layoutPayload = {
        name: layout.name,
        base_map_url: layout.base_map_url,
        status: layout.status,
        base_width: layout.base_width || CONSTANTS.DEFAULT_BASE_WIDTH,
        base_height: layout.base_height || CONSTANTS.DEFAULT_BASE_HEIGHT,
        global_scale: layout.global_scale || CONSTANTS.DEFAULT_GLOBAL_SCALE
      };

      if (layout.id) {
        const { data, error } = await seatLayoutService.updateLayout(layout.id, layoutPayload);
        if (error) throw error;
        savedLayoutData = data;
      } else {
        const { data, error } = await seatLayoutService.createLayout(layoutPayload);
        if (error) throw error;
        savedLayoutData = data;
      }

      if (savedLayoutData && layout.seats) {
        // Prepare seats payload - remove all non-db fields and handle IDs
        const seatsPayload = layout.seats.map(s => {
          const { 
            id, 
            layout_id, 
            created_at, 
            updated_at, 
            category, // nested object from join
            ...dbFields 
          } = s as any;

          const seatToSave: any = {
            ...dbFields,
            layout_id: savedLayoutData.id
          };

          // Only include ID if it's a valid UUID (not "new-...")
          if (id && !id.startsWith('new-')) {
            seatToSave.id = id;
          }

          return seatToSave;
        });

        console.log('[SeatLayoutEditor] Saving seats payload:', seatsPayload);
        const { error: seatsError } = await seatLayoutService.saveSeats(savedLayoutData.id, seatsPayload);
        if (seatsError) throw seatsError;

        // OPTIMIZATION: Skip full refresh - local state is already correct!
        // Just verify save succeeded with quick metadata check
        const { data: refreshedMeta, error: metaError } = await seatLayoutService.getLayoutMeta(savedLayoutData.id);
        if (metaError) throw metaError;
        
        // Update only the metadata, keep seats as-is
        if (refreshedMeta) {
          setLayout(prev => ({
            ...prev,
            ...refreshedMeta,
            seats: prev.seats // Keep existing seats (already correct)
          }));
          setSelectedSeatIds([]); // Clear selection
        }
        
        const totalEndTime = performance.now();
        const totalTime = (totalEndTime - totalStartTime).toFixed(2);
        console.log(`[SeatLayoutEditor] Total save time: ${totalTime}ms`);
        toast.success(`Layout saved successfully (${totalTime}ms)`, { id: saveToastId });
      }
    } catch (err: any) {
      console.error('[SeatLayoutEditor] Save Error Details:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        fullError: err
      });
      toast.error(`Failed to save layout: ${err.message || 'Unknown error'}`, { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${layout.name || 'layout'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          const newSeats = imported.seats || [];
          setLayout(prev => ({
            ...prev,
            ...imported,
            id: prev.id // Preserve ID if editing existing
          }));
          addToHistory(newSeats);
          toast.success('Layout imported successfully');
        } catch (err) {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadToastId = toast.loading('Uploading image...');
    
    try {
      // Use temporary ID if layout doesn't exist yet
      const tempLayoutId = layout.id || `temp-${Date.now()}`;
      console.log('[SeatLayoutEditor] Starting upload for file:', file.name, 'Layout ID:', tempLayoutId);
      
      // Upload to Supabase Storage
      const { data: publicUrl, error } = await seatLayoutService.uploadBaseMapImage(file, tempLayoutId);
      
      console.log('[SeatLayoutEditor] Upload response:', { publicUrl, error });
      
      if (error) {
        toast.error(`Upload failed: ${error.message || 'Unknown error'}`, { id: uploadToastId });
        console.error('[SeatLayoutEditor] Upload error:', error);
        return;
      }

      if (!publicUrl) {
        toast.error('No URL returned from upload', { id: uploadToastId });
        console.error('[SeatLayoutEditor] No publicUrl returned');
        return;
      }

      console.log('[SeatLayoutEditor] Setting base_map_url to:', publicUrl);
      
      // Update layout with public URL
      setLayout(prev => {
        const updated = { 
          ...prev, 
          base_map_url: publicUrl 
        };
        console.log('[SeatLayoutEditor] Layout state updated:', updated);
        return updated;
      });
      
      toast.success('Image uploaded successfully', { id: uploadToastId });
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`, { id: uploadToastId });
      console.error('[SeatLayoutEditor] Upload exception:', err);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const selectedSeats = useMemo(() => 
    layout.seats?.filter(s => selectedSeatIds.includes(s.id)) || [], 
    [layout.seats, selectedSeatIds]
  );
  const isMultiSelect = selectedSeatIds.length > 1;
  const firstSelectedSeat = selectedSeats[0];

  return (
    <div className="seat-editor-container">
      {/* Left Toolbar */}
      <aside className="seat-editor-toolbar">
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Layers className="w-5 h-5" /> Tools
          </h2>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="flex-1 justify-start gap-2" onClick={handleAddSeat}>
              <Plus className="w-4 h-4" /> Add Seat
            </Button>
          </div>

          {categories.length === 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> No Categories
                </div>
                <p className="text-[10px] text-amber-700">You need categories before adding seats.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-7 text-[10px] bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={handleSeedDefaultCategories}
                >
                  Seed Defaults
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="snap-grid" className="text-xs font-bold uppercase text-muted-foreground cursor-pointer">Snap to Grid</Label>
              <Switch 
                id="snap-grid" 
                checked={snapToGrid} 
                onCheckedChange={setSnapToGrid} 
              />
            </div>
            {snapToGrid && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Grid Size (%)</Label>
                <Input 
                  type="number" 
                  value={gridSize} 
                  onChange={(e) => {
                    const val = Math.max(CONSTANTS.MIN_GRID_SIZE, Math.min(CONSTANTS.MAX_GRID_SIZE, Number(e.target.value)));
                    setGridSize(val);
                  }}
                  min={CONSTANTS.MIN_GRID_SIZE} 
                  max={CONSTANTS.MAX_GRID_SIZE}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Base Map</p>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
               <input 
                 type="file" 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={handleFileUpload}
                 accept="image/*"
               />
               <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
               <p className="text-[10px] text-muted-foreground">Upload denah area (PNG/JPG)</p>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saved Layouts</p>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchLayouts}>
                <History className="h-3 w-3" />
              </Button>
            </div>
            <div className="max-h-[150px] overflow-y-auto space-y-1 pr-1">
              {layouts.map(l => (
                <div 
                  key={l.id} 
                  className={`group flex items-center justify-between p-2 rounded-md text-[10px] cursor-pointer transition-colors ${layout.id === l.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 hover:bg-muted'}`}
                  onClick={() => handleSelectLayout(l.id)}
                >
                  <div className="flex flex-col truncate">
                    <span className="font-bold truncate">{l.name}</span>
                    <span className="text-[8px] opacity-60 uppercase">{l.status}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLayoutClick(l.id, l.name);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {layouts.length === 0 && !isLoadingLayouts && (
                <p className="text-[10px] text-center text-muted-foreground py-2 italic">No saved layouts</p>
              )}
              {isLoadingLayouts && (
                <p className="text-[10px] text-center text-muted-foreground py-2 animate-pulse">Loading...</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full h-7 text-[10px]" onClick={handleCreateNew}>
              + Create New Layout
            </Button>
          </div>
          )}

          <Separator />

          {categories.length > 0 && (
            <div className="pt-2 space-y-2">
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Categories</p>
               <div className="flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <Badge key={cat.id} variant="outline" className="text-[9px] px-1 h-5 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                       {cat.name}
                    </Badge>
                  ))}
               </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4 mt-auto">
          <Button 
            className="w-full gap-2" 
            onClick={handleSaveLayout} 
            disabled={isSaving}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} /> 
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <div className="grid grid-cols-2 gap-2">
             <Button variant="outline" size="sm" onClick={handleExport}>
               <Download className="w-3 h-3 mr-1" /> Export
             </Button>
             <div className="relative">
               <input 
                 type="file" 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={handleImport}
                 accept=".json"
               />
               <Button variant="outline" size="sm" className="w-full">
                 <Upload className="w-3 h-3 mr-1" /> Import
               </Button>
             </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <History className="w-3 h-3 mr-1" /> View History
          </Button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="seat-editor-canvas-area" onClick={handleCanvasClick}>
        {/* Responsive Container - Synced with User Display */}
        {/* Outer wrapper for zoom - doesn't affect coordinate calculations */}
        <div
          style={{
            zoom: `${zoom * 100}%`,
            transformOrigin: 'center',
            marginBottom: `${(zoom - 1) * 100}px`
          }}
        >
        <div
          ref={canvasContainerRef}
          style={{
            width: '100%',
            maxWidth: SEAT_LAYOUT_CONSTANTS.MAX_DISPLAY_WIDTH,
            margin: '0 auto',
            aspectRatio: `${layout.base_width || CONSTANTS.DEFAULT_BASE_WIDTH}/${layout.base_height || CONSTANTS.DEFAULT_BASE_HEIGHT}`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            ref={canvasRef}
            className="seat-map-canvas"
            style={{ 
              width: '100%',
              height: '100%',
              backgroundColor: layout.base_map_url ? 'transparent' : '#fff',
              // NOTE: NO transform: scale() here! Zoom is applied at wrapper level
              // This preserves coordinate space for accurate seat positioning
              // Layered background: Grid (if enabled) + Base Map
              backgroundImage: [
                snapToGrid ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px)` : null,
                snapToGrid ? `linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)` : null,
                layout.base_map_url ? `url("${layout.base_map_url}")` : null
              ].filter(Boolean).join(', '),
              backgroundSize: [
                snapToGrid ? `${gridSize}% 100%` : null,
                snapToGrid ? `100% ${gridSize}%` : null,
                'contain'
              ].filter(Boolean).join(', '),
              backgroundRepeat: 'repeat, repeat, no-repeat',
              backgroundPosition: 'center',
              backgroundOrigin: 'content-box',
              position: 'relative'
            }}
          >
          {!layout.base_map_url && !snapToGrid && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>Belum ada denah area. Silakan upload denah.</p>
            </div>
          )}

          {layout.seats?.map((seat) => {
            const category = categories.find(c => c.id === seat.category_id);
            const isSelected = selectedSeatIds.includes(seat.id);
            const isDragged = draggedSeatId === seat.id;
            
            // Calculate scaling using shared coordinate system (identical to user display)
            const dims = calculateSeatDimensions(
              containerWidth,
              layout.base_width || CONSTANTS.DEFAULT_BASE_WIDTH,
              layout.global_scale || CONSTANTS.DEFAULT_GLOBAL_SCALE,
              seat.seat_width || 1.0,
              seat.seat_length || 1.0
            );
            
            return (
              <motion.div
                key={seat.id}
                drag
                dragMomentum={false}
                dragElastic={0}
                onDragStart={() => handleDragStart(seat.id)}
                onDrag={(e, info) => handleSeatDrag(seat.id, info)}
                onDragEnd={handleDragEnd}
                onClick={(e) => handleSeatClick(e, seat.id)}
                className={`seat-item ${isSelected ? 'selected' : ''} ${isDragged ? 'dragging' : ''}`}
                style={{
                  left: `${seat.x_pos}%`,
                  top: `${seat.y_pos}%`,
                  backgroundColor: category?.color || '#94a3b8',
                  transform: 'translate(-50%, -50%)',
                  // Use dimensions from shared coordinate system
                  width: `${dims.width}px`,
                  height: `${dims.height}px`,
                  opacity: seat.seat_height ? 0.5 + (seat.seat_height / 1.5) * 0.5 : 1,
                  zIndex: isDragged ? SEAT_LAYOUT_CONSTANTS.Z_INDEX.SEAT_DRAGGING : isSelected ? SEAT_LAYOUT_CONSTANTS.Z_INDEX.SEAT_SELECTED : SEAT_LAYOUT_CONSTANTS.Z_INDEX.SEAT_DEFAULT,
                  cursor: isDragged ? 'grabbing' : 'grab',
                  transition: isDragged ? 'none' : 'background-color 0.2s ease'
                }}
              >
                {seat.seat_number}
                {isSelected && !isDragged && (
                  <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none opacity-50" />
                )}
                {isDragged && (
                  <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none shadow-lg" />
                )}
              </motion.div>
            );
          })}
          </div>
        </div>
        </div>
        {/* /zoom wrapper */}

        {/* Canvas Controls */}
        <div className="canvas-controls">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => setZoom(prev => Math.min(CONSTANTS.MAX_ZOOM, prev + CONSTANTS.ZOOM_STEP))}
             disabled={zoom >= CONSTANTS.MAX_ZOOM}
           >
             <ZoomIn className="w-4 h-4" />
           </Button>
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => setZoom(prev => Math.max(CONSTANTS.MIN_ZOOM, prev - CONSTANTS.ZOOM_STEP))}
             disabled={zoom <= CONSTANTS.MIN_ZOOM}
           >
             <ZoomOut className="w-4 h-4" />
           </Button>
           <Separator orientation="vertical" className="h-6" />
           <Badge variant="outline">{Math.round(zoom * 100)}%</Badge>
        </div>
      </main>

      {/* Right Properties Sidebar */}
      <aside className="seat-editor-sidebar">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold">Properties</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Layout Name</label>
                <Input 
                  value={layout.name} 
                  onChange={(e) => {
                    const name = e.target.value.trim();
                    // Validate: max 100 chars, no leading/trailing spaces
                    if (name.length <= 100) {
                      setLayout(prev => ({ ...prev, name: e.target.value }));
                    }
                  }}
                  maxLength={100}
                  placeholder="Enter layout name"
                />
                {layout.name && layout.name.length > 0 && (
                  <p className="text-[8px] text-muted-foreground">{layout.name.length}/100</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Status</label>
                <Select 
                  value={layout.status} 
                  onValueChange={(val: any) => setLayout(prev => ({ ...prev, status: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-2" />
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Grid3X3 className="w-3 h-3" /> Canvas Scaling
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-muted-foreground">Base Width (px)</label>
                    <Input 
                      type="number"
                      value={layout.base_width} 
                      onChange={(e) => {
                        const val = Math.max(400, Number(e.target.value)); // Minimum 400px
                        setLayout(prev => ({ ...prev, base_width: val }));
                      }}
                      min={400}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-muted-foreground">Base Height (px)</label>
                    <Input 
                      type="number"
                      value={layout.base_height} 
                      onChange={(e) => {
                        const val = Math.max(300, Number(e.target.value)); // Minimum 300px
                        setLayout(prev => ({ ...prev, base_height: val }));
                      }}
                      min={300}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-muted-foreground">Global Scale Multiplier</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min={CONSTANTS.MIN_DIMENSION} 
                      max={2.0} 
                      step="0.1"
                      value={layout.global_scale || CONSTANTS.DEFAULT_GLOBAL_SCALE}
                      onChange={(e) => setLayout(prev => ({ ...prev, global_scale: Number(e.target.value) }))}
                      className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono w-8">{(layout.global_scale || CONSTANTS.DEFAULT_GLOBAL_SCALE).toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {selectedSeatIds.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {isMultiSelect ? `${selectedSeatIds.length} Seats Selected` : `Seat: ${firstSelectedSeat.seat_number}`}
                </h3>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSeat(selectedSeatIds)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {!isMultiSelect && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Seat Number</label>
                    <Input 
                      value={firstSelectedSeat.seat_number} 
                      onChange={(e) => handleUpdateSeat([firstSelectedSeat.id], { seat_number: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Category</label>
                  <Select 
                    value={isMultiSelect ? (selectedSeats.every(s => s.category_id === firstSelectedSeat.category_id) ? firstSelectedSeat.category_id : undefined) : firstSelectedSeat.category_id} 
                    onValueChange={(val) => handleUpdateSeat(selectedSeatIds, { category_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isMultiSelect ? "Mixed Categories" : "Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center">
                            <span className="category-badge" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Status</label>
                  <Select 
                    value={isMultiSelect ? (selectedSeats.every(s => s.status === firstSelectedSeat.status) ? firstSelectedSeat.status : undefined) : firstSelectedSeat.status} 
                    onValueChange={(val: any) => handleUpdateSeat(selectedSeatIds, { status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isMultiSelect ? "Mixed Status" : "Status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase text-muted-foreground">X Pos (%)</label>
                     <Input 
                       type="number"
                       step="0.1"
                       value={isMultiSelect ? "" : firstSelectedSeat.x_pos.toFixed(1)} 
                       placeholder={isMultiSelect ? "Mixed" : ""}
                       onChange={(e) => {
                         const val = Math.max(0, Math.min(100, Number(e.target.value)));
                         handleUpdateSeat(selectedSeatIds, { x_pos: val });
                       }}
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase text-muted-foreground">Y Pos (%)</label>
                     <Input 
                       type="number"
                       step="0.1"
                       value={isMultiSelect ? "" : firstSelectedSeat.y_pos.toFixed(1)} 
                       placeholder={isMultiSelect ? "Mixed" : ""}
                       onChange={(e) => {
                         const val = Math.max(0, Math.min(100, Number(e.target.value)));
                         handleUpdateSeat(selectedSeatIds, { y_pos: val });
                       }}
                     />
                   </div>
                </div>

                <Separator />
                
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground">Dimensions (meters)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-muted-foreground">Length</label>
                      <Input 
                        type="number"
                        step="0.1"
                        min={CONSTANTS.MIN_DIMENSION}
                        max={CONSTANTS.MAX_LENGTH}
                        value={isMultiSelect ? "" : (firstSelectedSeat.seat_length || 1.0)} 
                        placeholder={isMultiSelect ? "-" : ""}
                        onChange={(e) => {
                          const val = Math.max(CONSTANTS.MIN_DIMENSION, Math.min(CONSTANTS.MAX_LENGTH, Number(e.target.value)));
                          handleUpdateSeat(selectedSeatIds, { seat_length: val });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-muted-foreground">Width</label>
                      <Input 
                        type="number"
                        step="0.1"
                        min={CONSTANTS.MIN_DIMENSION}
                        max={CONSTANTS.MAX_LENGTH}
                        value={isMultiSelect ? "" : (firstSelectedSeat.seat_width || 1.0)} 
                        placeholder={isMultiSelect ? "-" : ""}
                        onChange={(e) => {
                          const val = Math.max(CONSTANTS.MIN_DIMENSION, Math.min(CONSTANTS.MAX_LENGTH, Number(e.target.value)));
                          handleUpdateSeat(selectedSeatIds, { seat_width: val });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-muted-foreground">Height</label>
                      <Input 
                        type="number"
                        step="0.1"
                        min={CONSTANTS.MIN_HEIGHT}
                        max={CONSTANTS.MAX_HEIGHT}
                        value={isMultiSelect ? "" : (firstSelectedSeat.seat_height || 1.0)} 
                        placeholder={isMultiSelect ? "-" : ""}
                        onChange={(e) => {
                          const val = Math.max(CONSTANTS.MIN_HEIGHT, Math.min(CONSTANTS.MAX_HEIGHT, Number(e.target.value)));
                          handleUpdateSeat(selectedSeatIds, { seat_height: val });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {isMultiSelect && (
                  <p className="text-[10px] text-muted-foreground italic">
                    Note: Changing dimensions will apply to all selected seats.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
               <MousePointer2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
               <p className="text-xs">Pilih satu atau beberapa kursi untuk mengedit properti (Ctrl+Klik)</p>
            </div>
          )}
        </div>
      </aside>

      {/* Delete Layout Confirmation Dialog */}
      <AlertDialog open={deleteConfirmation.open} onOpenChange={(open) => 
        setDeleteConfirmation(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Layout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the layout <strong>"{deleteConfirmation.layoutName}"</strong>? This action cannot be undone and all seats will be lost.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Delete Layout
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeatLayoutEditor;
