import React, { useState, useEffect } from "react";  
import { base44 } from "@/api/base44Client";  
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";  
import { Zap, GraduationCap, Plus, Search } from "lucide-react";  
import { motion, AnimatePresence } from "framer-motion";  
import { Button } from "@/components/ui/button";  
import { Input } from "@/components/ui/input";  
import {  
  Select,  
  SelectContent,  
  SelectItem,  
  SelectTrigger,  
  SelectValue,  
} from "@/components/ui/select";  
import { Badge } from "@/components/ui/badge";  
import ToolCard from "../components/toolkit/ToolCard";  
import ToolDetailsDialog from "../components/toolkit/ToolDetailsDialog";  
import AddToolDialog from "../components/toolkit/AddToolDialog";  
import EditToolDialog from "../components/toolkit/EditToolDialog";  
import AdvancedFilters from "../components/toolkit/AdvancedFilters";

const categories \= \["الكل", "ميديا", "صوت", "إنتاجية", "وكلاء", "منصات", "تسويق", "برمجة", "تصميم", "كتابة", "تحليل بيانات", "بحث", "محادثة", "أخرى"\];

export default function HomePage() {  
  const \[selectedType, setSelectedType\] \= useState(null);  
  const \[selectedCategory, setSelectedCategory\] \= useState("الكل");  
  const \[searchQuery, setSearchQuery\] \= useState("");  
  const \[sortBy, setSortBy\] \= useState("recent");  
  const \[advancedFilters, setAdvancedFilters\] \= useState({  
    pricing: "all",  
    minRating: "0",  
    onlyFeatured: false,  
  });  
  const \[selectedTool, setSelectedTool\] \= useState(null);  
  const \[addDialogOpen, setAddDialogOpen\] \= useState(false);  
  const \[editingTool, setEditingTool\] \= useState(null);  
  const \[user, setUser\] \= useState(null);  
  const queryClient \= useQueryClient();

  useEffect(() \=\> {  
    const loadUser \= async () \=\> {  
      try {  
        const currentUser \= await base44.auth.me();  
        setUser(currentUser);  
      } catch (error) {  
        console.log("User not logged in");  
      }  
    };  
    loadUser();  
  }, \[\]);

  const { data: tools \= \[\], isLoading } \= useQuery({  
    queryKey: \['tools'\],  
    queryFn: () \=\> base44.entities.Tool.list('-created\_date'),  
  });

  const { data: favorites \= \[\] } \= useQuery({  
    queryKey: \['favorites', user?.email\],  
    queryFn: () \=\> user ? base44.entities.Favorite.filter({ user\_email: user.email }) : \[\],  
    enabled: \!\!user,  
  });

  const isFavorite \= (toolId) \=\> {  
    return favorites.some(fav \=\> fav.tool\_id \=== toolId);  
  };

  const filteredTools \= tools  
    .filter(tool \=\> {  
      const typeMatch \= selectedType \=== 'Tool'  
        ? tool.type \=== 'Tool' || \!tool.type  
        : selectedType \=== 'Learn'  
        ? tool.type \=== 'Learn'  
        : true;  
       
      const categoryMatch \= selectedCategory \=== "الكل" || tool.category \=== selectedCategory;  
       
      const searchMatch \= searchQuery \=== "" ||  
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||  
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||  
        (tool.tags && tool.tags.some(tag \=\> tag.toLowerCase().includes(searchQuery.toLowerCase())));  
       
      const pricingMatch \= advancedFilters.pricing \=== "all" || tool.pricing \=== advancedFilters.pricing;  
      const ratingMatch \= (tool.average\_rating || 0) \>= parseFloat(advancedFilters.minRating);  
      const featuredMatch \= \!advancedFilters.onlyFeatured || tool.is\_featured;  
       
      return typeMatch && categoryMatch && searchMatch && pricingMatch && ratingMatch && featuredMatch;  
    })  
    .sort((a, b) \=\> {  
      if (sortBy \=== "recent") return new Date(b.created\_date) \- new Date(a.created\_date);  
      if (sortBy \=== "usage") return (b.usage\_count || 0) \- (a.usage\_count || 0);  
      if (sortBy \=== "featured") return (b.is\_featured ? 1 : 0) \- (a.is\_featured ? 1 : 0);  
      if (sortBy \=== "alphabetical") return a.name.localeCompare(b.name, 'ar');  
      if (sortBy \=== "rating") return (b.average\_rating || 0) \- (a.average\_rating || 0);  
      if (sortBy \=== "most\_favorited") return (b.favorite\_count || 0) \- (a.favorite\_count || 0);  
      return 0;  
    });

  const handleSuccess \= () \=\> {  
    queryClient.invalidateQueries(\['tools'\]);  
  };

  return (  
    \<div className="min-h-screen p-4 md:p-8 bg-\[\#fafafa\] dark:bg-\[\#0a0a0a\]"\>  
      \<motion.div  
        initial={{ opacity: 0 }}  
        animate={{ opacity: 1 }}  
        className="text-center pt-2 pb-4"  
      \>  
        \<p className="text-xs font-bold text-black/60 dark:text-white/60" style={{ fontFamily: 'Amiri, serif', fontStyle: 'italic' }}\>  
          صُنع وحُدّث بواسطة \<span className="text-\[\#4ECDC4\] font-black"\>عمر حسين\</span\> بـ \<span className="text-\[\#FF6B6B\] font-black"\>Base44\</span\>  
        \</p\>  
      \</motion.div\>

      \<div className="max-w-7xl mx-auto"\>  
        \<motion.div  
          initial={{ opacity: 0, y: \-20 }}  
          animate={{ opacity: 1, y: 0 }}  
          className="text-center mb-8 mt-4"  
        \>  
          \<div className="inline-block mb-6"\>  
            \<div className="neo-border bg-gradient-to-r from-\[\#4ECDC4\] to-\[\#FF6B6B\] px-6 py-3"\>  
              \<span className="text-black font-black uppercase text-lg"\>AI TOOLKIT HUB ⚡\</span\>  
            \</div\>  
          \</div\>  
           
          \<h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 text-black dark:text-white leading-tight"\>  
            إذا كنت تتفق معي حقبة الذكاء الاصطناعي هذه عجيبة غريبة  
          \</h1\>  
          \<p className="text-xl md:text-2xl font-bold text-black dark:text-white mb-8"\>  
            اكتشف أفضل الأدوات وطرق التطبيق  
          \</p\>

          \<div className="flex justify-center gap-4 flex-wrap mb-8"\>  
            \<Button  
              onClick={() \=\> setSelectedType(selectedType \=== 'Tool' ? null : 'Tool')}  
              className={\`neo-button font-black text-base px-6 py-6 ${  
                selectedType \=== 'Tool'  
                  ? 'bg-\[\#4ECDC4\] text-black'  
                  : 'bg-white dark:bg-\[\#1a1a1a\] text-black dark:text-white'  
              }\`}  
            \>  
              \<Zap className="w-5 h-5 ml-2 stroke-\[3\]" /\>  
              أدوات قوية  
            \</Button\>  
            \<Button  
              onClick={() \=\> setSelectedType(selectedType \=== 'Learn' ? null : 'Learn')}  
              className={\`neo-button font-black text-base px-6 py-6 ${  
                selectedType \=== 'Learn'  
                  ? 'bg-\[\#FF6B6B\] text-white'  
                  : 'bg-white dark:bg-\[\#1a1a1a\] text-black dark:text-white'  
              }\`}  
            \>  
              \<GraduationCap className="w-5 h-5 ml-2 stroke-\[3\]" /\>  
              التعلم والتطبيق  
            \</Button\>  
          \</div\>  
        \</motion.div\>

        \<motion.div  
          initial={{ opacity: 0, y: 20 }}  
          animate={{ opacity: 1, y: 0 }}  
          transition={{ delay: 0.1 }}  
          className="neo-card bg-white dark:bg-\[\#1a1a1a\] p-6 mb-8"  
        \>  
          \<div className="flex flex-col md:flex-row gap-4 mb-6"\>  
            {user?.role \=== 'admin' && (  
              \<Button  
                onClick={() \=\> setAddDialogOpen(true)}  
                className="neo-button bg-\[\#FF6B6B\] hover:bg-\[\#FF5252\] text-white font-black uppercase"  
              \>  
                \<Plus className="w-5 h-5 ml-2 stroke-\[3\]" /\>  
                ADD  
              \</Button\>  
            )}

            \<Select value={selectedCategory} onValueChange={setSelectedCategory}\>  
              \<SelectTrigger className="md:w-48 border-4 border-black dark:border-white font-bold h-12"\>  
                \<SelectValue /\>  
              \</SelectTrigger\>  
              \<SelectContent className="border-4 border-black dark:border-white"\>  
                {categories.map((cat) \=\> (  
                  \<SelectItem key={cat} value={cat} className="font-bold"\>  
                    {cat}  
                  \</SelectItem\>  
                ))}  
              \</SelectContent\>  
            \</Select\>

            \<div className="flex-1 relative"\>  
              \<Search className="absolute right-4 top-1/2 transform \-translate-y-1/2 w-5 h-5 text-black dark:text-white stroke-\[3\]" /\>  
              \<Input  
                placeholder="...SEARCH TOOLS"  
                value={searchQuery}  
                onChange={(e) \=\> setSearchQuery(e.target.value)}  
                className="w-full pr-12 border-4 border-black dark:border-white font-bold h-12 text-right"  
              /\>  
            \</div\>  
          \</div\>

          \<div className="space-y-4"\>  
            \<AdvancedFilters filters={advancedFilters} onFiltersChange={setAdvancedFilters} /\>  
             
            \<div className="flex flex-wrap gap-2"\>  
              {categories.slice(1).map((category) \=\> (  
                \<Badge  
                  key={category}  
                  onClick={() \=\> setSelectedCategory(category)}  
                  className={\`cursor-pointer font-bold uppercase text-sm px-3 py-2 border-3 transition-all ${  
                    selectedCategory \=== category  
                      ? 'bg-\[\#FFD700\] text-black border-black dark:border-white shadow-\[2px\_2px\_0px\_0px\_rgba(0,0,0,1)\]'  
                      : 'bg-white dark:bg-\[\#1a1a1a\] text-black dark:text-white border-black dark:border-white hover:bg-\[\#FFD700\]'  
                  }\`}  
                \>  
                  {category}  
                \</Badge\>  
              ))}  
            \</div\>  
          \</div\>  
        \</motion.div\>

        \<div className="flex justify-between items-center mb-6"\>  
          \<div className="neo-card bg-\[\#95E1D3\] px-4 py-2 inline-block"\>  
            \<p className="font-black text-black uppercase text-sm"\>  
              {filteredTools.length} {selectedType \=== 'Tool' ? 'أداة' : selectedType \=== 'Learn' ? 'درس' : 'نتيجة'}  
            \</p\>  
          \</div\>

          \<Select value={sortBy} onValueChange={setSortBy}\>  
            \<SelectTrigger className="w-48 border-4 border-black dark:border-white font-bold h-12"\>  
              \<SelectValue /\>  
            \</SelectTrigger\>  
            \<SelectContent className="border-4 border-black dark:border-white"\>  
              \<SelectItem value="recent" className="font-bold"\>الأحدث\</SelectItem\>  
              \<SelectItem value="rating" className="font-bold"\>الأعلى تقييماً\</SelectItem\>  
              \<SelectItem value="most\_favorited" className="font-bold"\>الأكثر تفضيلاً\</SelectItem\>  
              \<SelectItem value="usage" className="font-bold"\>الأكثر استخداماً\</SelectItem\>  
              \<SelectItem value="featured" className="font-bold"\>المميزة\</SelectItem\>  
              \<SelectItem value="alphabetical" className="font-bold"\>أبجدياً\</SelectItem\>  
            \</SelectContent\>  
          \</Select\>  
        \</div\>

        {isLoading ? (  
          \<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"\>  
            {Array(6).fill(0).map((\_, i) \=\> (  
              \<div key={i} className="neo-card h-64 bg-white dark:bg-\[\#1a1a1a\] animate-pulse" /\>  
            ))}  
          \</div\>  
        ) : filteredTools.length \=== 0 ? (  
          \<motion.div  
            initial={{ opacity: 0 }}  
            animate={{ opacity: 1 }}  
            className="text-center py-20"  
          \>  
            \<div className="neo-card bg-\[\#95E1D3\] p-12 inline-block"\>  
              \<div className="text-6xl mb-4"\>🔍\</div\>  
              \<h3 className="text-3xl font-black text-black mb-2 uppercase"\>  
                لا توجد نتائج  
              \</h3\>  
              \<p className="text-black font-bold uppercase"\>  
                جرب البحث بكلمات أخرى  
              \</p\>  
            \</div\>  
          \</motion.div\>  
        ) : (  
          \<motion.div  
            initial={{ opacity: 0 }}  
            animate={{ opacity: 1 }}  
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"  
          \>  
            \<AnimatePresence mode="popLayout"\>  
              {filteredTools.map((tool, index) \=\> (  
                \<motion.div  
                  key={tool.id}  
                  initial={{ opacity: 0, scale: 0.9 }}  
                  animate={{ opacity: 1, scale: 1 }}  
                  exit={{ opacity: 0, scale: 0.9 }}  
                  transition={{ delay: index \* 0.02 }}  
                  layout  
                \>  
                  \<ToolCard  
                    tool={tool}  
                    onSelect={setSelectedTool}  
                    isFavorite={isFavorite(tool.id)}  
                    user={user}  
                    onEdit={setEditingTool}  
                  /\>  
                \</motion.div\>  
              ))}  
            \</AnimatePresence\>  
          \</motion.div\>  
        )}  
      \</div\>

      \<ToolDetailsDialog  
        tool={selectedTool}  
        open={\!\!selectedTool}  
        onOpenChange={(open) \=\> \!open && setSelectedTool(null)}  
        isFavorite={selectedTool ? isFavorite(selectedTool.id) : false}  
        user={user}  
      /\>

      \<AddToolDialog  
        open={addDialogOpen}  
        onOpenChange={setAddDialogOpen}  
        onSuccess={handleSuccess}  
      /\>

      \<EditToolDialog  
        tool={editingTool}  
        open={\!\!editingTool}  
        onOpenChange={(open) \=\> \!open && setEditingTool(null)}  
        onSuccess={handleSuccess}  
      /\>  
    \</div\>  
  );  
}  
