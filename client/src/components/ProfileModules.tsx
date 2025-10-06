import { useState, useRef, useEffect } from "react"
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { GripVertical, X, Maximize2, Plus, Save, Eye, Edit2, ChevronDown, BookCopy, CopyPlus } from 'lucide-react';
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { toast } from "sonner";

// ==================== TYPES ====================

interface ProfileModuleElementType {
  id: number;
  type: string;
  content: string;
  options?: string[];
}

interface ProfileModuleType {
  key: string;
  name: string;
  elements: ProfileModuleElementType[];
}

interface ModuleDataEntry {
  type: string;
  data: { id: number; content: string; selectedOption?: string }[];
}

interface DraggableModule {
  id: number;
  type: string;
  title: string;
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
  visible: boolean;
  data: { id: number; content: string; selectedOption?: string }[];
}

interface ProfileModuleEditorProps {
  initialModules?: DraggableModule[];
  onSave?: (modules: DraggableModule[]) => void;
  initialMode?: 'edit' | 'view';
}

interface ScrollingTextProps {
  text: string;
  className?: string;
}

// ==================== MODULE DEFINITIONS ====================

const ProfileModules: ProfileModuleType[] = [
  { key: "favoriteFood", name: "My favorite food is...", elements: [
    { id: 1, type: 'dropdown', content: 'Select your favorite food', options: ['Pizza', 'Sushi', 'Burgers', 'Tacos', 'Pasta', 'Salad', 'Other'] }
  ]},
  { key: "physicalStats", name: "I am", elements: [
    { id: 1, type: 'dropdown', content: 'Select your build', options: ['Athletic', 'Average', 'Slim', 'Muscular', 'Curvy', 'Plus-sized'] }
  ]},
  { key: "loveLanguage", name: "My love language is...", elements: [
    { id: 1, type: 'dropdown', content: 'Select your love language', options: ['Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 'Quality Time', 'Physical Touch'] }
  ]},
  { key: "zodiacSign", name: "My zodiac sign is...", elements: [
    { id: 1, type: 'dropdown', content: 'Select your zodiac sign', options: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] }
  ]},
  { key: "purdueCourse", name: "My favorite thing about Purdue is...", elements: [
    { id: 1, type: 'dropdown', content: 'Select your favorite thing', options: ['Campus', 'Sports', 'Academics', 'Social Life', 'Clubs', 'Location', 'Food'] }
  ]},
  { key: "diningHall", name: "The best dining hall is...", elements: [
    { id: 1, type: 'dropdown', content: 'Select dining hall', options: ['Earhart', 'Wiley', 'Ford', 'Hillenbrand', 'Windsor'] }
  ]},
  { key: "about", name: "About Me", elements: [
    { id: 1, type: 'dropdown', content: 'Select personality type', options: ['Outgoing', 'Introverted', 'Adventurous', 'Homebody', 'Creative', 'Analytical'] }
  ]},
  { key: "skills", name: "Skills", elements: [
    { id: 1, type: 'dropdown', content: 'Select your top skill', options: ['Programming', 'Design', 'Communication', 'Leadership', 'Problem Solving', 'Writing'] }
  ]},
  { key: "experience", name: "Experience", elements: [
    { id: 1, type: 'dropdown', content: 'Select experience level', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }
  ]},
  { key: "projects", name: "Projects", elements: [
    { id: 1, type: 'dropdown', content: 'Select project type', options: ['Web Development', 'Mobile App', 'Research', 'Hardware', 'AI/ML', 'Data Science'] }
  ]},
  { key: "education", name: "Education", elements: [
    { id: 1, type: 'dropdown', content: 'Select education level', options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'] }
  ]},
  { key: "certifications", name: "Certifications", elements: [
    { id: 1, type: 'dropdown', content: 'Select certification type', options: ['AWS', 'Google Cloud', 'Azure', 'CompTIA', 'Cisco', 'Other'] }
  ]},
  { key: "languages", name: "Languages", elements: [
    { id: 1, type: 'dropdown', content: 'Select language proficiency', options: ['Beginner', 'Conversational', 'Fluent', 'Native'] }
  ]},
  { key: "contact", name: "Contact Info", elements: [
    { id: 1, type: 'dropdown', content: 'Select preferred contact method', options: ['Email', 'Phone', 'LinkedIn', 'Discord', 'Slack'] }
  ]},
  { key: "social", name: "Social Links", elements: [
    { id: 1, type: 'dropdown', content: 'Select primary platform', options: ['Instagram', 'Twitter/X', 'LinkedIn', 'GitHub', 'TikTok', 'Facebook'] }
  ]},
  { key: "achievements", name: "Achievements", elements: [
    { id: 1, type: 'dropdown', content: 'Select achievement type', options: ['Academic', 'Athletic', 'Leadership', 'Community Service', 'Competition', 'Research'] }
  ]},
  { key: "hobbies", name: "Hobbies", elements: [
    { id: 1, type: 'dropdown', content: 'Select hobby', options: ['Gaming', 'Reading', 'Sports', 'Music', 'Art', 'Cooking', 'Travel'] }
  ]},
  { key: "music", name: "Music Taste", elements: [
    { id: 1, type: 'dropdown', content: 'Select music genre', options: ['Pop', 'Rock', 'Hip Hop', 'Country', 'Electronic', 'Classical', 'Jazz', 'R&B'] }
  ]},
  { key: "movies", name: "Favorite Movies", elements: [
    { id: 1, type: 'dropdown', content: 'Select movie genre', options: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Documentary'] }
  ]},
  { key: "books", name: "Reading List", elements: [
    { id: 1, type: 'dropdown', content: 'Select book genre', options: ['Fiction', 'Non-Fiction', 'Fantasy', 'Mystery', 'Biography', 'Self-Help', 'Science'] }
  ]},
  { key: "travel", name: "Travel", elements: [
    { id: 1, type: 'dropdown', content: 'Select travel preference', options: ['Beach', 'Mountains', 'City', 'Countryside', 'Adventure', 'Relaxation'] }
  ]},
];

const getModuleByKey = (key: string): ProfileModuleType | undefined => {
  return ProfileModules.find(m => m.key === key);
};

// ==================== PROFILE MODULE COMPONENTS ====================

const ProfileModuleElement: React.FC<{
  element: ProfileModuleElementType;
  content: { id: number; content: string; selectedOption?: string }[] | undefined;
  editable: boolean;
  onUpdate?: (id: number, value: string) => void;
}> = ({ element, content, editable, onUpdate }) => {
  const [selectedValue, setSelectedValue] = useState(
    content?.find((entry) => entry.id === element.id)?.selectedOption || ""
  );
  const [inputValue, setInputValue] = useState(
    content?.find((entry) => entry.id === element.id)?.content || ""
  );

  const handleDropdownSelect = (value: string) => {
    setSelectedValue(value);
    if (onUpdate) {
      onUpdate(element.id, value);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (onUpdate) {
      onUpdate(element.id, value);
    }
  };

  switch (element.type.toLowerCase()) {
    case 'dropdown':
      if (!editable) {
        const selectedVal = content?.find((entry) => entry.id === element.id)?.selectedOption;
        return <ScrollingText text = {selectedVal || "Not selected"} className="text-slate-700 w-full font-bold text-left text-[clamp(1rem,5vw,3rem)]" />;
      }
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between hover:cursor-pointer">
              {selectedValue || element.content}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {element.options?.map((option, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleDropdownSelect(option)}
                className = "hover:cursor-pointer"
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    case 'textarea':
      if (!editable) {
        return <div>{content ? content.find((entry) => entry.id === element.id)?.content : ""}</div>;
      }
      return (
        <textarea 
          placeholder={element.content} 
          value={inputValue} 
          onChange={handleTextChange} 
          className="w-full resize-none p-2 border border-slate-300 rounded-md"
        />
      );
    default:
      return null;
  }
};

function ProfileModule(moduleData: ModuleDataEntry, index: number, editable: boolean) {
  const moduleType = getModuleByKey(moduleData.type);
  if (!moduleType) return null;

  return (
    <div key={index} className="w-full p-1">
      <Card>
        <CardContent>
          {moduleType.elements.map((element) => (
            <div key={element.id} className="mb-2">
              <ProfileModuleElement
                element={element}
                content={moduleData.data}
                editable={editable}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileModuleContainer(profileData: ModuleDataEntry[], editable: boolean) {
  return (
    <div className="flex flex-wrap">
      {profileData.map((module, index) => ProfileModule(module, index, editable))}
    </div>
  );
}

// ==================== MODULE EDITOR ====================

function ProfileModuleEditor({ initialModules, onSave, initialMode = 'edit' }: ProfileModuleEditorProps) {
  const COLS = 6;
  const ROWS = 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const availableModuleTypes = ProfileModules.map(module => ({
    type: module.key,
    title: module.name,
  }));

  const [mode, setMode] = useState<'edit' | 'view'>(initialMode);
  const [modules, setModules] = useState<DraggableModule[]>(initialModules || []);
  const [savedModules, setSavedModules] = useState<DraggableModule[]>(initialModules || []);
  const [nextId, setNextId] = useState(() => {
    if (!initialModules || initialModules.length === 0) return 1;
    return Math.max(...initialModules.map(m => m.id)) + 1;
  });
  const [dragging, setDragging] = useState<any>(null);
  const [resizing, setResizing] = useState<any>(null);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  const cellWidth = containerSize.width / COLS;
  const cellHeight = containerSize.height / ROWS;

  const isOccupied = (x: number, y: number, width: number, height: number, excludeId: number | null) => {
    return modules.some(m => {
      if (!m.visible || m.id === excludeId) return false;
      return !(
        x >= m.gridX + m.gridWidth ||
        x + width <= m.gridX ||
        y >= m.gridY + m.gridHeight ||
        y + height <= m.gridY
      );
    });
  };

  const findNextAvailablePosition = (width = 1, height = 1) => {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (x + width <= COLS && !isOccupied(x, y, width, height, null)) {
          return { x, y };
        }
      }
    }
    return null;
  };

  const addModule = (moduleType: { type: string; title: string }) => {
    const position = findNextAvailablePosition();
    if (!position) {
      toast.error('No space available for new module. Try removing or reorganizing existing modules.');
      return;
    }

    const moduleTemplate = getModuleByKey(moduleType.type);
    if (!moduleTemplate) return;

    const newModule: DraggableModule = {
      id: nextId,
      type: moduleType.type,
      title: moduleType.title,
      gridX: position.x,
      gridY: position.y,
      gridWidth: 1,
      gridHeight: 1,
      visible: true,
      data: moduleTemplate.elements.map(el => ({ 
        id: el.id, 
        content: '', 
        selectedOption: '' 
      })),
    };

    setModules(prev => [...prev, newModule]);
    setNextId(nextId + 1);
    setShowModuleDropdown(false);
  };

  const handleModuleDataUpdate = (moduleId: number, elementId: number, value: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        const updatedData = m.data.map(d => 
          d.id === elementId ? { ...d, selectedOption: value, content: value } : d
        );
        return { ...m, data: updatedData };
      }
      return m;
    }));
  };

  const handleMouseDown = (e: React.MouseEvent, id: number, action: string) => {
    if (mode !== 'edit') return;
    e.preventDefault();
    const module = modules.find(m => m.id === id);
    if (!module) return;
    
    if (action === 'drag') {
      setDragging({
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialGridX: module.gridX,
        initialGridY: module.gridY,
      });
    } else if (action === 'resize') {
      setResizing({
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialGridWidth: module.gridWidth,
        initialGridHeight: module.gridHeight,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode !== 'edit') return;
    
    if (dragging) {
      const deltaX = e.clientX - dragging.startX;
      const deltaY = e.clientY - dragging.startY;
      
      const gridDeltaX = Math.round(deltaX / cellWidth);
      const gridDeltaY = Math.round(deltaY / cellHeight);
      
      const module = modules.find(m => m.id === dragging.id);
      if (!module) return;
      
      const newGridX = Math.max(0, Math.min(COLS - module.gridWidth, dragging.initialGridX + gridDeltaX));
      const newGridY = Math.max(0, Math.min(ROWS - module.gridHeight, dragging.initialGridY + gridDeltaY));
      
      if (!isOccupied(newGridX, newGridY, module.gridWidth, module.gridHeight, dragging.id)) {
        setModules(prev => prev.map(m => 
          m.id === dragging.id 
            ? { ...m, gridX: newGridX, gridY: newGridY }
            : m
        ));
      }
    } else if (resizing) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      
      const gridDeltaX = Math.round(deltaX / cellWidth);
      const gridDeltaY = Math.round(deltaY / cellHeight);
      
      const module = modules.find(m => m.id === resizing.id);
      if (!module) return;
      
      const newGridWidth = Math.max(1, Math.min(COLS - module.gridX, resizing.initialGridWidth + gridDeltaX));
      const newGridHeight = Math.max(1, Math.min(ROWS - module.gridY, resizing.initialGridHeight + gridDeltaY));
      
      if (!isOccupied(module.gridX, module.gridY, newGridWidth, newGridHeight, resizing.id)) {
        setModules(prev => prev.map(m => 
          m.id === resizing.id 
            ? { ...m, gridWidth: newGridWidth, gridHeight: newGridHeight }
            : m
        ));
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const toggleModule = (id: number) => {
    if (mode !== 'edit') return;
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, visible: !m.visible } : m
    ));
  };

  const saveProfile = () => {
    const profileData = {
      modules: modules.map(m => ({
        type: m.type,
        gridX: m.gridX,
        gridY: m.gridY,
        gridWidth: m.gridWidth,
        gridHeight: m.gridHeight,
        visible: m.visible,
        data: m.data,
      })),
    };
    
    const json = JSON.stringify(profileData, null, 2);
    console.log('Profile saved:', json);
    
    setSavedModules(JSON.parse(JSON.stringify(modules)));
    
    if (onSave) {
      onSave(modules);
    }
    
    toast.success('Profile saved!');
  };

  const enterEditMode = () => {
    setSavedModules(JSON.parse(JSON.stringify(modules)));
    setMode('edit');
  };

  const cancelEdits = () => {
    setModules(JSON.parse(JSON.stringify(savedModules)));
    setMode('view');
  };

  const getUnusedModuleTypes = () => {
    const usedTypes = new Set(modules.filter(m => m.visible).map(m => m.type));
    return availableModuleTypes.filter(type => !usedTypes.has(type.type));
  };

  return (
    <div 
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="h-full flex flex-col">
        {mode === 'edit' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={cancelEdits}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm hover:cursor-pointer"
              >
                <Eye size={16} />
                Cancel & Preview
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowModuleDropdown(!showModuleDropdown)}
                  disabled={getUnusedModuleTypes().length === 0 || !findNextAvailablePosition()}
                  title={!findNextAvailablePosition() ? "No space to add modules" : undefined}
                  className="flex items-center gap-2 px-3 py-2 bg-[#49a355] text-white rounded-lg hover:bg-[#398043] hover:cursor-pointer transition-colors disabled:bg-[#8cc293] disabled:cursor-not-allowed text-sm"
                >
                  <CopyPlus size = {14}/>
                  Modules
                </button>
                
                {showModuleDropdown && getUnusedModuleTypes().length > 0 && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border-2 border-slate-200 z-10 min-w-64">
                    <div className="max-h-96 overflow-y-auto">
                      {getUnusedModuleTypes().map(moduleType => (
                        <button
                          key={moduleType.type}
                          onClick={() => addModule(moduleType)}
                          className="w-full text-left px-4 py-3 hover:cursor-pointer hover:bg-slate-200 rounded transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-semibold text-slate-800 text-sm">{moduleType.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={saveProfile}
                className="flex items-center gap-2 px-3 py-2 bg-[#5976ab] hover:bg-[#41567d] hover:cursor-pointer text-white rounded-lg transition-colors text-sm"
              >
                <Save size={16} />
                Save Profile
              </button>

              <div className="text-xs text-slate-500">
                {modules.filter(m => m.visible).length} / {availableModuleTypes.length} modules active
              </div>
            </div>
          </>
        )}

        {mode === 'view' && initialMode === 'edit' && (
          <div className="mb-4">
            <button
              onClick={enterEditMode}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm hover:cursor-pointer"
            >
              <Edit2 size={16} />
              Edit Layout
            </button>
          </div>
        )}

        <div 
          ref={containerRef}
          className="relative bg-white rounded-lg shadow-md border-2 border-slate-200 flex-1"
          style={{ 
            backgroundImage: mode === 'edit' ? `
              linear-gradient(to right, #e2e8f0 1px, transparent 1px),
              linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            ` : 'none',
            backgroundSize: `${100/COLS}% ${100/ROWS}%`,
          }}
        >
          {modules.filter(m => m.visible).map(module => {
            const moduleType = getModuleByKey(module.type);
            const displayTitle = moduleType?.name;
            const padding = 4; // pixels of padding around each module
            
            return (
              <div
                key={module.id}
                className="absolute bg-white rounded-lg shadow-md border-2 border-gray-300 overflow-hidden transition-all"
                style={{
                  left: `${module.gridX * cellWidth + padding}px`,
                  top: `${module.gridY * cellHeight + padding}px`,
                  width: `${module.gridWidth * cellWidth - padding * 2}px`,
                  height: `${module.gridHeight * cellHeight - padding * 2}px`,
                  cursor: mode === 'edit' && dragging?.id === module.id ? 'grabbing' : 'default',
                }}
              >
                <div 
                  className={`text-black p-2 flex items-center justify-between ${
                    mode === 'edit' ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  onMouseDown={mode === 'edit' ? (e) => handleMouseDown(e, module.id, 'drag') : undefined}
                >
                  <div className="flex items-center gap-2">
                    {mode === 'edit' && <GripVertical size={16} />}
                    <Label className="text-xl">{displayTitle}</Label>
                  </div>
                  {mode === 'edit' && (
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="hover:bg-gray-200 hover:cursor-pointer rounded p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                <div className="overflow-auto" style={{ height: 'calc(100% - 52px)' }}>
                  {moduleType && moduleType.elements.map((element) => (
                    <div key={element.id} className={`p-3 h-full flex ${mode !== 'edit' ? 'items-center' : ''} justify-center`}>
                      <ProfileModuleElement
                        element={element}
                        content={module.data}
                        editable={mode === "edit"}
                        onUpdate={(elementId, value) => handleModuleDataUpdate(module.id, elementId, value)}
                      />
                    </div>
                  ))}
                </div>

                {mode === 'edit' && (
                  <div
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize transition-colors rounded"
                    onMouseDown={(e) => handleMouseDown(e, module.id, 'resize')}
                  >
                    <Maximize2 size={12} className="absolute bottom-1 right-1 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}

          {modules.filter(m => m.visible).length === 0 && (
            <div className="flex items-center justify-center h-full text-slate-400 absolute inset-0">
              <p className="text-sm">
                {mode === 'edit' 
                  ? 'No modules visible. Click "Add Module" to get started.' 
                  : 'No modules in this profile.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =================== SCROLLING TEXT ==================

function ScrollingText({ text, className = '' }: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const animationId = useRef(`scroll-${Math.random().toString(36).substr(2, 9)}`).current;

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        const overflow = textWidth > containerWidth;
        
        setIsOverflowing(overflow);
        setScrollDistance(textWidth - containerWidth);
        
        console.log('Text:', text, 'Container:', containerWidth, 'Text width:', textWidth, 'Overflow:', overflow);
      }
    };

    setTimeout(checkOverflow, 100);
    
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (textRef.current) {
      resizeObserver.observe(textRef.current);
    }
    
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden relative ${className}`}
    >
      <div
        ref={textRef}
        className={`whitespace-nowrap inline-block ${!isOverflowing ? 'w-full text-center' : ''}`}
        style={isOverflowing ? {
          animation: `${animationId} 8s ease-in-out infinite`
        } : {}}
      >
        {text}
      </div>
      {isOverflowing && (
        <style>{`
          @keyframes ${animationId} {
            0%, 10% { transform: translateX(0px); }
            45%, 55% { transform: translateX(-${scrollDistance}px); }
            90%, 100% { transform: translateX(0px); }
          }
        `}</style>
      )}
    </div>
  );
}

// ==================== EXPORTS ====================

export {
  ProfileModuleContainer,
  ProfileModuleEditor,
  ProfileModules,
  getModuleByKey
}

export type {
  ProfileModuleElementType,
  ProfileModuleType,
  ModuleDataEntry,
  DraggableModule
}