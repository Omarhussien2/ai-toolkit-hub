import React, { useState } from "react";  
import {  
  Dialog,  
  DialogContent,  
  DialogHeader,  
  DialogTitle,  
} from "@/components/ui/dialog";  
import { Button } from "@/components/ui/button";  
import { Badge } from "@/components/ui/badge";  
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";  
import {  
  Select,  
  SelectContent,  
  SelectItem,  
  SelectTrigger,  
  SelectValue,  
} from "@/components/ui/select";  
import { ExternalLink, Heart, Star, Calendar, TrendingUp, Tag, FolderOpen, Link2 } from "lucide-react";  
import { base44 } from "@/api/base44Client";  
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";  
import { toast } from "sonner";  
import { format } from "date-fns";  
import { ar } from "date-fns/locale";  
import { motion } from "framer-motion";  
import ReviewForm from "../reviews/ReviewForm";  
import ReviewsList from "../reviews/ReviewsList";

export default function ToolDetailsDialog({ tool, open, onOpenChange, isFavorite, user, currentCollection }) {  
  const \[showReviewForm, setShowReviewForm\] \= useState(false);  
  const queryClient \= useQueryClient();  
  const \[selectedCollectionId, setSelectedCollectionId\] \= React.useState(currentCollection || "");

  const { data: collections \= \[\] } \= useQuery({  
    queryKey: \['collections', user?.email\],  
    queryFn: () \=\> user ? base44.entities.Collection.filter({ user\_email: user.email }) : \[\],  
    enabled: \!\!user && open,  
  });

  const { data: favorites \= \[\] } \= useQuery({  
    queryKey: \['favorites', user?.email\],  
    queryFn: () \=\> user ? base44.entities.Favorite.filter({ user\_email: user.email }) : \[\],  
    enabled: \!\!user && open,  
  });

  const { data: allTools \= \[\] } \= useQuery({  
    queryKey: \['tools'\],  
    queryFn: () \=\> base44.entities.Tool.list(),  
    enabled: open,  
  });

  const { data: reviews \= \[\] } \= useQuery({  
    queryKey: \['reviews', tool?.id\],  
    queryFn: () \=\> base44.entities.Review.filter({ tool\_id: tool.id, is\_approved: true }),  
    enabled: open && \!\!tool,  
  });

  const userReview \= reviews.find(r \=\> r.user\_email \=== user?.email);

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
          collection\_id: selectedCollectionId || null,  
        });  
        toast.success("تمت الإضافة إلى المفضلة");  
      }  
    },  
    onSuccess: () \=\> {  
      queryClient.invalidateQueries(\['favorites'\]);  
    },  
  });

  const moveToCollectionMutation \= useMutation({  
    mutationFn: async (collectionId) \=\> {  
      const favorite \= favorites.find(f \=\> f.tool\_id \=== tool.id && f.user\_email \=== user.email);  
      if (favorite) {  
        await base44.entities.Favorite.update(favorite.id, {  
          collection\_id: collectionId || null,  
        });  
        toast.success("تم نقل الأداة إلى المجموعة");  
      }  
    },  
    onSuccess: () \=\> {  
      queryClient.invalidateQueries(\['favorites'\]);  
    },  
  });

  const handleCollectionChange \= (collectionId) \=\> {  
    setSelectedCollectionId(collectionId);  
    if (isFavorite) {  
      moveToCollectionMutation.mutate(collectionId);  
    }  
  };

  if (\!tool) return null;

  const currentFavorite \= favorites.find(f \=\> f.tool\_id \=== tool.id && f.user\_email \=== user?.email);  
  const relatedTools \= tool.related\_tools  
    ? allTools.filter(t \=\> tool.related\_tools.includes(t.id))  
    : \[\];

  return (  
    \<Dialog open={open} onOpenChange={onOpenChange}\>  
      \<DialogContent className="max-w-3xl max-h-\[90vh\] overflow-y-auto neo-card bg-white dark:bg-\[\#1a1a1a\]" dir="rtl"\>  
        \<DialogHeader\>  
          \<DialogTitle className="text-3xl font-black text-black dark:text-white uppercase"\>  
            {tool.name}  
          \</DialogTitle\>  
        \</DialogHeader\>

        \<div className="space-y-6"\>  
          \<div className="relative h-64 neo-border bg-gradient-to-br from-\[\#4ECDC4\] to-\[\#FF6B6B\] overflow-hidden"\>  
            {tool.image\_url ? (  
              \<img  
                src={tool.image\_url}  
                alt={tool.name}  
                className="w-full h-full object-cover"  
              /\>  
            ) : (  
              \<div className="w-full h-full flex items-center justify-center"\>  
                \<span className="text-8xl"\>🛠️\</span\>  
              \</div\>  
            )}  
             
            {tool.is\_featured && (  
              \<div className="absolute top-4 left-4"\>  
                \<Badge className="bg-\[\#FFD700\] text-black border-3 border-black font-black uppercase px-4 py-2"\>  
                  \<Star className="w-4 h-4 ml-2 fill-black stroke-\[3\]" /\>  
                  FEATURED  
                \</Badge\>  
              \</div\>  
            )}

            {tool.type \=== 'Learn' && (  
              \<div className="absolute top-4 right-4"\>  
                \<Badge className="bg-\[\#FF6B6B\] text-white border-3 border-black font-black uppercase px-4 py-2"\>  
                  📚 LEARN  
                \</Badge\>  
              \</div\>  
            )}  
          \</div\>

          \<div className="flex flex-wrap gap-2"\>  
            \<Badge className="bg-\[\#4ECDC4\] text-black border-3 border-black dark:border-white font-black uppercase px-3 py-1 text-sm"\>  
              {tool.category}  
            \</Badge\>  
            {tool.pricing && (  
              \<Badge className="bg-white dark:bg-\[\#1a1a1a\] text-black dark:text-white border-3 border-black dark:border-white font-black uppercase px-3 py-1 text-sm"\>  
                {tool.pricing}  
              \</Badge\>  
            )}  
            {(tool.average\_rating || 0) \> 0 && (  
              \<Badge className="bg-\[\#FFD700\] text-black border-3 border-black dark:border-white font-black uppercase px-3 py-1 text-sm"\>  
                \<Star className="w-4 h-4 ml-1 fill-black stroke-\[3\]" /\>  
                {tool.average\_rating.toFixed(1)} ({tool.review\_count})  
              \</Badge\>  
            )}  
            \</div\>

          \<div\>  
            \<h3 className="text-lg font-black text-black dark:text-white mb-2 uppercase"\>  
              الوصف  
            \</h3\>  
            \<p className="text-black dark:text-white font-bold leading-relaxed"\>  
              {tool.description}  
            \</p\>  
          \</div\>

          {user && isFavorite && collections.length \> 0 && (  
            \<div\>  
              \<h3 className="text-lg font-black text-black dark:text-white mb-2 uppercase flex items-center gap-2"\>  
                \<FolderOpen className="w-5 h-5 stroke-\[3\]" /\>  
                المجموعة  
              \</h3\>  
              \<Select  
                value={currentFavorite?.collection\_id || "none"}  
                onValueChange={handleCollectionChange}  
              \>  
                \<SelectTrigger className="w-full border-4 border-black dark:border-white font-bold h-12"\>  
                  \<SelectValue placeholder="اختر مجموعة" /\>  
                \</SelectTrigger\>  
                \<SelectContent className="border-4 border-black dark:border-white"\>  
                  \<SelectItem value="none"\>بدون مجموعة\</SelectItem\>  
                  {collections.map((collection) \=\> (  
                    \<SelectItem key={collection.id} value={collection.id}\>  
                      \<span className="ml-2"\>{collection.icon}\</span\>  
                      {collection.name}  
                    \</SelectItem\>  
                  ))}  
                \</SelectContent\>  
              \</Select\>  
            \</div\>  
          )}

          \<div className="neo-card bg-\[\#FFD700\] p-4 grid grid-cols-2 gap-4"\>  
            \<div\>  
              \<div className="flex items-center gap-2 text-black mb-1"\>  
                \<Calendar className="w-4 h-4 stroke-\[3\]" /\>  
                \<span className="text-xs font-black uppercase"\>تاريخ الإضافة\</span\>  
              \</div\>  
              \<p className="font-black text-black"\>  
                {format(new Date(tool.created\_date), "d MMMM yyyy", { locale: ar })}  
              \</p\>  
            \</div\>  
            \<div\>  
              \<div className="flex items-center gap-2 text-black mb-1"\>  
                \<ExternalLink className="w-4 h-4 stroke-\[3\]" /\>  
                \<span className="text-xs font-black uppercase"\>الرابط\</span\>  
              \</div\>  
              \<a  
                href={tool.url}  
                target="\_blank"  
                rel="noopener noreferrer"  
                className="font-black text-black hover:underline truncate block text-sm"  
              \>  
                {tool.url.replace(/^https?:\\/\\//, '').substring(0, 30)}...  
              \</a\>  
            \</div\>  
          \</div\>

          \<div className="flex gap-3"\>  
            \<Button  
              className="flex-1 neo-button bg-\[\#4ECDC4\] hover:bg-\[\#3DBDB3\] text-black font-black uppercase h-12 text-base"  
              onClick={() \=\> window.open(tool.url, '\_blank')}  
            \>  
              \<ExternalLink className="w-5 h-5 ml-2 stroke-\[3\]" /\>  
              {tool.type \=== 'Learn' ? 'ابدأ التعلم' : 'زيارة الأداة'}  
            \</Button\>  
            {user && (  
              \<Button  
                className={\`h-12 px-6 neo-button ${isFavorite ? 'bg-\[\#FF6B6B\] hover:bg-\[\#FF5252\] text-white' : 'bg-white dark:bg-\[\#1a1a1a\] text-black dark:text-white'} font-black uppercase\`}  
                onClick={() \=\> toggleFavoriteMutation.mutate()}  
              \>  
                \<Heart className={\`w-5 h-5 stroke-\[3\] ${isFavorite ? 'fill-current' : ''}\`} /\>  
              \</Button\>  
            )}  
          \</div\>  
        \</div\>  
      \</DialogContent\>  
    \</Dialog\>  
  );  
}

