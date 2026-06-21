import React, { useState } from "react";  
import { motion } from "framer-motion";  
import { ExternalLink, Heart, Star, Trash2, TrendingUp, Zap, ImageOff, Edit, Users } from "lucide-react";  
import { Card, CardContent } from "@/components/ui/card";  
import { Badge } from "@/components/ui/badge";  
import { Button } from "@/components/ui/button";  
import { base44 } from "@/api/base44Client";  
import { useMutation, useQueryClient } from "@tanstack/react-query";  
import { toast } from "sonner";

const categoryColors \= {  
  "ميديا": "bg-\[\#FF6B6B\]",  
  "صوت": "bg-\[\#4ECDC4\]",  
  "إنتاجية": "bg-\[\#95E1D3\]",  
  "وكلاء": "bg-\[\#FFD700\]",  
  "منصات": "bg-\[\#A8E6CF\]",  
  "تسويق": "bg-\[\#FF8B94\]",  
  "برمجة": "bg-\[\#C7CEEA\]",  
  "تصميم": "bg-\[\#FFDAC1\]",  
  "كتابة": "bg-\[\#B5EAD7\]",  
  "تحليل بيانات": "bg-\[\#FFE5D9\]",  
  "بحث": "bg-\[\#E2F0CB\]",  
  "محادثة": "bg-\[\#FFAAA5\]",  
  "أخرى": "bg-\[\#D4A5A5\]"  
};

const SHEETY\_API\_URL \= "https://api.sheety.co/872f7b0fbd5fddf4f8d7240c231a8b12/aiToolkit/tools";

export default function ToolCard({ tool, onSelect, isFavorite, user, onEdit }) {  
  const queryClient \= useQueryClient();  
  const \[imageError, setImageError\] \= useState(false);  
  const \[imageLoading, setImageLoading\] \= useState(true);

  const toggleFavoriteMutation \= useMutation({  
    mutationFn: async () \=\> {  
      if (\!user) {  
        base44.auth.redirectToLogin(window.location.pathname);  
        return;  
      }  
       
      const existingFavorites \= await base44.entities.Favorite.filter({  
        tool\_id: tool.id,  
        user\_email: user.email,  
      });

      if (existingFavorites.length \> 0) {  
        await base44.entities.Favorite.delete(existingFavorites\[0\].id);  
        toast.success("تمت الإزالة من المفضلة");  
      } else {  
        await base44.entities.Favorite.create({  
          tool\_id: tool.id,  
          user\_email: user.email,  
        });  
        toast.success("تمت الإضافة إلى المفضلة");  
      }  
    },  
    onSuccess: () \=\> {  
      queryClient.invalidateQueries(\['favorites'\]);  
    },  
  });

  const findSheetRowId \= async (toolName) \=\> {  
    try {  
      const response \= await fetch(SHEETY\_API\_URL);  
      if (\!response.ok) return null;  
       
      const data \= await response.json();  
      const sheetTool \= data.tools?.find(t \=\> t.tool \=== toolName);  
      return sheetTool?.id || null;  
    } catch (error) {  
      console.error('خطأ في البحث عن الصف:', error);  
      return null;  
    }  
  };

  const deleteFromGoogleSheets \= async (toolName) \=\> {  
    try {  
      const sheetRowId \= await findSheetRowId(toolName);  
      if (\!sheetRowId) {  
        console.log('الأداة غير موجودة في Google Sheets');  
        return;  
      }

      const response \= await fetch(\`${SHEETY\_API\_URL}/${sheetRowId}\`, {  
        method: 'DELETE',  
      });

      if (\!response.ok) {  
        throw new Error('فشل الحذف من Google Sheets');  
      }  
    } catch (error) {  
      console.error('خطأ في حذف من Sheety:', error);  
      throw error;  
    }  
  };

  const deleteToolMutation \= useMutation({  
    mutationFn: async () \=\> {  
      await base44.entities.Tool.delete(tool.id);  
       
      const currentUser \= await base44.auth.me();  
      await base44.entities.ActivityLog.create({  
        action\_type: "حذف",  
        tool\_name: tool.name,  
        user\_email: currentUser.email,  
        details: \`تم حذف الأداة: ${tool.name}\`,  
      });

      try {  
        await deleteFromGoogleSheets(tool.name);  
        toast.success("تم حذف الأداة من Google Sheets بنجاح\! ✓", { duration: 3000 });  
      } catch (error) {  
        toast.warning("تم الحذف محلياً ولكن فشلت المزامنة مع Google Sheets", { duration: 5000 });  
      }  
    },  
    onSuccess: () \=\> {  
      queryClient.invalidateQueries(\['tools'\]);  
      toast.success("تم حذف الأداة بنجاح ✓");  
    },  
    onError: () \=\> {  
      toast.error("حدث خطأ أثناء حذف الأداة");  
    }  
  });

  const handleDelete \= (e) \=\> {  
    e.stopPropagation();  
    if (window.confirm("هل أنت متأكد من حذف هذه الأداة من التطبيق و Google Sheets؟")) {  
      deleteToolMutation.mutate();  
    }  
  };

  const handleEdit \= (e) \=\> {  
    e.stopPropagation();  
    if (onEdit) {  
      onEdit(tool);  
    }  
  };

  const handleVisit \= (e) \=\> {  
    e.stopPropagation();  
    window.open(tool.url, '\_blank');  
  };

  const handleImageError \= () \=\> {  
    setImageError(true);  
    setImageLoading(false);  
  };

  const handleImageLoad \= () \=\> {  
    setImageLoading(false);  
  };

  return (  
    \<motion.div  
      whileHover={{ y: \-4 }}  
      transition={{ duration: 0.1 }}  
    \>  
      \<Card  
        className="h-full neo-card cursor-pointer bg-white dark:bg-\[\#1a1a1a\] overflow-hidden"  
        onClick={() \=\> onSelect(tool)}  
      \>  
        \<div className={\`relative h-40 ${categoryColors\[tool.category\] || "bg-\[\#D4A5A5\]"} border-b-4 border-black dark:border-white overflow-hidden\`}\>  
          {tool.image\_url && \!imageError ? (  
            \<\>  
              {imageLoading && (  
                \<div className="absolute inset-0 flex items-center justify-center"\>  
                  \<div className="animate-pulse"\>  
                    \<Zap className="w-16 h-16 stroke-\[3\] text-black" /\>  
                  \</div\>  
                \</div\>  
              )}  
              \<img  
                src={tool.image\_url}  
                alt={tool.name}  
                className="w-full h-full object-cover"  
                onError={handleImageError}  
                onLoad={handleImageLoad}  
                style={{ display: imageLoading ? 'none' : 'block' }}  
              /\>  
            \</\>  
          ) : (  
            \<div className="w-full h-full flex flex-col items-center justify-center gap-2"\>  
              {imageError && tool.image\_url ? (  
                \<\>  
                  \<ImageOff className="w-12 h-12 stroke-\[3\] text-black" /\>  
                  \<span className="text-xs font-bold text-black uppercase"\>IMAGE ERROR\</span\>  
                \</\>  
              ) : (  
                \<Zap className="w-16 h-16 stroke-\[3\] text-black" /\>  
              )}  
            \</div\>  
          )}  
           
          {tool.is\_featured && (  
            \<div className="absolute top-3 left-3"\>  
              \<Badge className="bg-\[\#FFD700\] text-black border-3 border-black font-black uppercase px-3 py-1"\>  
                \<Star className="w-4 h-4 ml-1 fill-black stroke-\[3\]" /\>  
                FEATURED  
              \</Badge\>  
            \</div\>  
          )}

          \<div className="absolute top-3 right-3 flex gap-2"\>  
            \<Button  
              size="icon"  
              className="h-10 w-10 neo-button-sm bg-white hover:bg-\[\#FF6B6B\] hover:text-white"  
              onClick={(e) \=\> {  
                e.stopPropagation();  
                toggleFavoriteMutation.mutate();  
              }}  
            \>  
              \<Heart  
                className={\`w-5 h-5 stroke-\[3\] ${  
                  isFavorite ? "fill-\[\#FF6B6B\] text-\[\#FF6B6B\]" : "text-black"  
                }\`}  
              /\>  
            \</Button\>  
          \</div\>  
        \</div\>

        \<CardContent className="p-5"\>  
          \<h3 className="text-xl font-black text-black dark:text-white line-clamp-1 mb-3 uppercase"\>  
            {tool.name}  
          \</h3\>

          \<p className="text-sm font-bold text-black dark:text-white mb-4 line-clamp-2 min-h-\[40px\]"\>  
            {tool.description}  
          \</p\>

          \<div className="flex flex-wrap gap-2 mb-4"\>  
            \<Badge className={\`${categoryColors\[tool.category\] || "bg-\[\#D4A5A5\]"} text-black border-3 border-black dark:border-white font-black uppercase\`}\>  
              {tool.category}  
            \</Badge\>  
            {tool.pricing && (  
              \<Badge className="bg-white dark:bg-\[\#1a1a1a\] text-black dark:text-white border-3 border-black dark:border-white font-black uppercase"\>  
                {tool.pricing}  
                \</Badge\>  
                )}  
                {(tool.average\_rating || 0) \> 0 && (  
                \<Badge className="bg-\[\#FFD700\] text-black border-3 border-black dark:border-white font-black uppercase"\>  
                \<Star className="w-3 h-3 ml-1 fill-black stroke-\[3\]" /\>  
                {tool.average\_rating.toFixed(1)}  
                \</Badge\>  
                )}  
                {(tool.favorite\_count || 0) \> 0 && (  
                \<Badge className="bg-\[\#FF6B6B\] text-white border-3 border-black dark:border-white font-black uppercase"\>  
                \<Users className="w-3 h-3 ml-1 stroke-\[3\]" /\>  
                {tool.favorite\_count}  
                \</Badge\>  
                )}  
                \</div\>

          \<div className="flex gap-2"\>  
            \<Button  
              size="sm"  
              className="flex-1 neo-button bg-\[\#4ECDC4\] hover:bg-\[\#3DBDB3\] text-black font-black uppercase"  
              onClick={handleVisit}  
            \>  
              \<ExternalLink className="w-4 h-4 ml-2 stroke-\[3\]" /\>  
              VISIT  
            \</Button\>  
            {user?.role \=== 'admin' && (  
              \<\>  
                \<Button  
                  size="sm"  
                  className="neo-button bg-\[\#FFD700\] hover:bg-\[\#FFC700\] text-black"  
                  onClick={handleEdit}  
                \>  
                  \<Edit className="w-4 h-4 stroke-\[3\]" /\>  
                \</Button\>  
                \<Button  
                  size="sm"  
                  className="neo-button bg-\[\#FF6B6B\] hover:bg-\[\#FF5252\] text-white"  
                  onClick={handleDelete}  
                \>  
                  \<Trash2 className="w-4 h-4 stroke-\[3\]" /\>  
                \</Button\>  
              \</\>  
            )}  
          \</div\>  
        \</CardContent\>  
      \</Card\>  
    \</motion.div\>  
  );  
}

