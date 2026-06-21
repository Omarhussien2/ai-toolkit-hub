import React, { useState } from "react";  
import {  
  Dialog,  
  DialogContent,  
  DialogHeader,  
  DialogTitle,  
  DialogFooter,  
} from "@/components/ui/dialog";  
import { Button } from "@/components/ui/button";  
import { Input } from "@/components/ui/input";  
import { Label } from "@/components/ui/label";  
import { Textarea } from "@/components/ui/textarea";  
import {  
  Select,  
  SelectContent,  
  SelectItem,  
  SelectTrigger,  
  SelectValue,  
} from "@/components/ui/select";  
import { base44 } from "@/api/base44Client";  
import { useMutation } from "@tanstack/react-query";  
import { toast } from "sonner";  
import { Loader2, Plus, ImageIcon, CheckCircle2 } from "lucide-react";  
import RelatedToolsSelector from "./RelatedToolsSelector";

const categories \= \["ميديا", "صوت", "إنتاجية", "وكلاء", "منصات", "تسويق", "برمجة", "تصميم", "كتابة", "تحليل بيانات", "بحث", "محادثة", "أخرى"\];

const SHEETY\_API\_URL \= "https://api.sheety.co/872f7b0fbd5fddf4f8d7240c231a8b12/aiToolkit/tools";

export default function AddToolDialog({ open, onOpenChange, onSuccess }) {  
  const \[formData, setFormData\] \= useState({  
    name: "",  
    name\_en: "",  
    description: "",  
    category: "أخرى",  
    url: "",  
    image\_url: "",  
    pricing: "مجاني",  
    tags: "",  
    notes: "",  
    type: "Tool",  
    related\_tools: \[\],  
  });  
  const \[imagePreview, setImagePreview\] \= useState(null);  
  const \[imageValid, setImageValid\] \= useState(false);

  const handleImageUrlChange \= (url) \=\> {  
    setFormData({ ...formData, image\_url: url });  
    setImagePreview(null);  
    setImageValid(false);  
     
    if (url) {  
      const img \= new Image();  
      img.onload \= () \=\> {  
        setImagePreview(url);  
        setImageValid(true);  
      };  
      img.onerror \= () \=\> {  
        setImagePreview(null);  
        setImageValid(false);  
      };  
      img.src \= url;  
    }  
  };

  const addToGoogleSheets \= async (toolData) \=\> {  
    try {  
      const response \= await fetch(SHEETY\_API\_URL, {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
        },  
        body: JSON.stringify({  
          tool: {  
            tool: toolData.name,  
            about: toolData.description,  
            catgory: toolData.category,  
            link: toolData.url,  
          }  
        })  
      });

      if (\!response.ok) {  
        throw new Error('فشلت الإضافة إلى Google Sheets');  
      }

      return await response.json();  
    } catch (error) {  
      console.error('خطأ في Sheety API:', error);  
      throw error;  
    }  
  };

  const createToolMutation \= useMutation({  
    mutationFn: async (data) \=\> {  
      const toolData \= {  
        ...data,  
        tags: data.tags ? data.tags.split(',').map(t \=\> t.trim()) : \[\],  
      };  
       
      const newTool \= await base44.entities.Tool.create(toolData);  
       
      const user \= await base44.auth.me();  
      await base44.entities.ActivityLog.create({  
        action\_type: "إضافة",  
        tool\_name: data.name,  
        user\_email: user.email,  
        details: \`تم إضافة ${data.type \=== 'Learn' ? 'درس' : 'أداة'}: ${data.name}\`,  
      });

      if (data.type \=== 'Tool') {  
        try {  
          await addToGoogleSheets(toolData);  
          toast.success("تمت إضافة الأداة إلى Google Sheets بنجاح\! ✓", { duration: 3000 });  
        } catch (error) {  
          toast.warning("تمت إضافة الأداة ولكن فشلت المزامنة مع Google Sheets", { duration: 5000 });  
        }  
      }

      return newTool;  
    },  
    onSuccess: (data) \=\> {  
      toast.success(data.type \=== 'Learn' ? "تمت إضافة الدرس بنجاح ✓" : "تمت إضافة الأداة بنجاح ✓");  
      onSuccess();  
      onOpenChange(false);  
      setFormData({  
        name: "",  
        name\_en: "",  
        description: "",  
        category: "أخرى",  
        url: "",  
        image\_url: "",  
        pricing: "مجاني",  
        tags: "",  
        notes: "",  
        type: "Tool",  
        related\_tools: \[\],  
      });  
      setImagePreview(null);  
      setImageValid(false);  
    },  
    onError: () \=\> {  
      toast.error("حدث خطأ أثناء الإضافة");  
    },  
  });

  const handleSubmit \= (e) \=\> {  
    e.preventDefault();  
    if (\!formData.name || \!formData.description || \!formData.url) {  
      toast.error("يرجى ملء جميع الحقول المطلوبة");  
      return;  
    }  
    createToolMutation.mutate(formData);  
  };

  return (  
    \<Dialog open={open} onOpenChange={onOpenChange}\>  
      \<DialogContent className="max-w-2xl max-h-\[90vh\] overflow-y-auto neo-card bg-white dark:bg-\[\#1a1a1a\]" dir="rtl"\>  
        \<DialogHeader\>  
          \<DialogTitle className="text-3xl font-black text-black dark:text-white uppercase"\>  
            {formData.type \=== 'Learn' ? 'ADD NEW LESSON' : 'ADD NEW TOOL'}  
          \</DialogTitle\>  
        \</DialogHeader\>

        \<form onSubmit={handleSubmit} className="space-y-4"\>  
          \<div className="space-y-2"\>  
            \<Label htmlFor="type" className="font-black uppercase"\>النوع \*\</Label\>  
            \<Select  
              value={formData.type}  
              onValueChange={(value) \=\> setFormData({ ...formData, type: value })}  
            \>  
              \<SelectTrigger className="border-4 border-black dark:border-white font-bold h-12"\>  
                \<SelectValue /\>  
              \</SelectTrigger\>  
              \<SelectContent className="border-4 border-black dark:border-white"\>  
                \<SelectItem value="Tool" className="font-bold"\>🛠️ أداة\</SelectItem\>  
                \<SelectItem value="Learn" className="font-bold"\>📚 درس تعليمي\</SelectItem\>  
              \</SelectContent\>  
            \</Select\>  
          \</div\>

          \<div className="grid grid-cols-1 md:grid-cols-2 gap-4"\>  
            \<div className="space-y-2"\>  
              \<Label htmlFor="name" className="font-black uppercase"\>الاسم \*\</Label\>  
              \<Input  
                id="name"  
                value={formData.name}  
                onChange={(e) \=\> setFormData({ ...formData, name: e.target.value })}  
                placeholder="أدخل الاسم"  
                className="border-4 border-black dark:border-white font-bold h-12"  
                required  
              /\>  
            \</div\>

            \<div className="space-y-2"\>  
              \<Label htmlFor="name\_en" className="font-black uppercase"\>الاسم (EN)\</Label\>  
              \<Input  
                id="name\_en"  
                value={formData.name\_en}  
                onChange={(e) \=\> setFormData({ ...formData, name\_en: e.target.value })}  
                placeholder="Name"  
                className="border-4 border-black dark:border-white font-bold h-12"  
              /\>  
            \</div\>  
          \</div\>

          \<div className="space-y-2"\>  
            \<Label htmlFor="description" className="font-black uppercase"\>الوصف \*\</Label\>  
            \<Textarea  
              id="description"  
              value={formData.description}  
              onChange={(e) \=\> setFormData({ ...formData, description: e.target.value })}  
              placeholder="وصف مختصر"  
              className="border-4 border-black dark:border-white font-bold"  
              rows={3}  
              required  
            /\>  
          \</div\>

          \<div className="grid grid-cols-1 md:grid-cols-2 gap-4"\>  
            \<div className="space-y-2"\>  
              \<Label htmlFor="category" className="font-black uppercase"\>التصنيف \*\</Label\>  
              \<Select  
                value={formData.category}  
                onValueChange={(value) \=\> setFormData({ ...formData, category: value })}  
              \>  
                \<SelectTrigger className="border-4 border-black dark:border-white font-bold h-12"\>  
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
            \</div\>

            \<div className="space-y-2"\>  
              \<Label htmlFor="pricing" className="font-black uppercase"\>التسعير\</Label\>  
              \<Select  
                value={formData.pricing}  
                onValueChange={(value) \=\> setFormData({ ...formData, pricing: value })}  
              \>  
                \<SelectTrigger className="border-4 border-black dark:border-white font-bold h-12"\>  
                  \<SelectValue /\>  
                \</SelectTrigger\>  
                \<SelectContent className="border-4 border-black dark:border-white"\>  
                  \<SelectItem value="مجاني" className="font-bold"\>مجاني\</SelectItem\>  
                  \<SelectItem value="مدفوع" className="font-bold"\>مدفوع\</SelectItem\>  
                  \<SelectItem value="freemium" className="font-bold"\>Freemium\</SelectItem\>  
                \</SelectContent\>  
              \</Select\>  
            \</div\>  
          \</div\>

          \<div className="space-y-2"\>  
            \<Label htmlFor="url" className="font-black uppercase"\>الرابط \*\</Label\>  
            \<Input  
              id="url"  
              type="url"  
              value={formData.url}  
              onChange={(e) \=\> setFormData({ ...formData, url: e.target.value })}  
              placeholder="https://example.com"  
              className="border-4 border-black dark:border-white font-bold h-12"  
              required  
            /\>  
          \</div\>

          \<div className="space-y-2"\>  
            \<Label htmlFor="image\_url" className="font-black uppercase flex items-center gap-2"\>  
              \<ImageIcon className="w-4 h-4 stroke-\[3\]" /\>  
              رابط الصورة  
              {imageValid && \<CheckCircle2 className="w-4 h-4 text-green-600 stroke-\[3\]" /\>}  
            \</Label\>  
            \<Input  
              id="image\_url"  
              type="url"  
              value={formData.image\_url}  
              onChange={(e) \=\> handleImageUrlChange(e.target.value)}  
              placeholder="https://example.com/image.jpg"  
              className="border-4 border-black dark:border-white font-bold h-12"  
              dir="ltr"  
            /\>  
            {imagePreview && (  
              \<div className="mt-2"\>  
                \<div className="neo-border bg-\[\#95E1D3\] p-2 inline-block"\>  
                  \<img  
                    src={imagePreview}  
                    alt="Preview"  
                    className="h-24 w-auto object-contain"  
                  /\>  
                \</div\>  
                \<p className="text-xs text-green-600 font-bold mt-2 uppercase"\>✓ IMAGE VALID\</p\>  
              \</div\>  
            )}  
            {formData.image\_url && \!imageValid && \!imagePreview && (  
              \<p className="text-xs text-red-600 font-bold uppercase"\>⚠ CHECKING IMAGE...\</p\>  
            )}  
          \</div\>

          \<RelatedToolsSelector  
            value={formData.related\_tools}  
            onChange={(tools) \=\> setFormData({ ...formData, related\_tools: tools })}  
            toolType={formData.type}  
          /\>

          \<div className="space-y-2"\>  
            \<Label htmlFor="tags" className="font-black uppercase"\>الوسوم (مفصولة بفاصلة)\</Label\>  
            \<Input  
              id="tags"  
              value={formData.tags}  
              onChange={(e) \=\> setFormData({ ...formData, tags: e.target.value })}  
              placeholder="ai, productivity, design"  
              className="border-4 border-black dark:border-white font-bold h-12"  
            /\>  
          \</div\>

          \<div className="space-y-2"\>  
            \<Label htmlFor="notes" className="font-black uppercase"\>ملاحظات إضافية\</Label\>  
            \<Textarea  
              id="notes"  
              value={formData.notes}  
              onChange={(e) \=\> setFormData({ ...formData, notes: e.target.value })}  
              placeholder="أي ملاحظات أخرى"  
              className="border-4 border-black dark:border-white font-bold"  
              rows={2}  
            /\>  
          \</div\>

          \<DialogFooter className="gap-2"\>  
            \<Button  
              type="button"  
              className="neo-button bg-white dark:bg-\[\#1a1a1a\] text-black dark:text-white font-black uppercase"  
              onClick={() \=\> onOpenChange(false)}  
            \>  
              CANCEL  
            \</Button\>  
            \<Button  
              type="submit"  
              disabled={createToolMutation.isPending}  
              className="neo-button bg-\[\#4ECDC4\] hover:bg-\[\#3DBDB3\] text-black font-black uppercase"  
            \>  
              {createToolMutation.isPending ? (  
                \<\>  
                  \<Loader2 className="w-5 h-5 ml-2 animate-spin stroke-\[3\]" /\>  
                  ADDING...  
                \</\>  
              ) : (  
                \<\>  
                  \<Plus className="w-5 h-5 ml-2 stroke-\[3\]" /\>  
                  ADD  
                \</\>  
              )}  
            \</Button\>  
          \</DialogFooter\>  
        \</form\>  
      \</DialogContent\>  
    \</Dialog\>  
  );  
}

