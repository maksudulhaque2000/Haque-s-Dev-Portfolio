"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";
import { ImageCropper } from "@/components/ui/image-cropper";
import { DragDropImageUpload } from "@/components/ui/drag-drop-image-upload";

export default function AboutManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    image: "",
    description: "",
    location: "",
    languages: [] as Array<{ name: string; proficiency: number }>,
    interests: [] as Array<{ name: string; icon?: string }>,
  });
  const [newLanguage, setNewLanguage] = useState({
    name: "",
    proficiency: "intermediate",
  });

  // Convert proficiency label to number for database storage
  const proficiencyToNumber = (label: string): number => {
    switch (label.toLowerCase()) {
      case "native":
        return 100; // Native speaker
      case "fluent":
        return 85; // Fluent speaker
      case "intermediate":
        return 50; // Intermediate level
      default:
        return 50;
    }
  };

  // Convert proficiency number to label for display
  const proficiencyToLabel = (value: number): string => {
    if (value >= 95) return "native";
    if (value >= 70) return "fluent";
    return "intermediate";
  };
  const [newInterest, setNewInterest] = useState({ name: "", icon: "" });
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/about")
      .then((res) => res.json())
      .then((data) => {
        if (data.about) {
          setFormData(data.about);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (croppedImageDataUrl: string) => {
    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();

      // Create FormData and upload
      const formData = new FormData();
      formData.append("file", blob, "cropped-image.jpg");
      formData.append("type", "image");

      const res = await fetch("/api/dashboard/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success("Image uploaded and cropped successfully!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.image || !formData.description || !formData.location) {
        toast.error("Please fill in all required fields (Image, Description, Location)");
        setSaving(false);
        return;
      }

      // Ensure languages array has correct structure
      const sanitizedLanguages = formData.languages.map((lang) => ({
        name: lang.name,
        proficiency: typeof lang.proficiency === 'number' ? lang.proficiency : 50,
      }));

      // Ensure interests array has correct structure
      const sanitizedInterests = formData.interests.map((interest) => ({
        name: interest.name,
        icon: interest.icon || undefined,
      }));

      const payload = {
        image: formData.image,
        description: formData.description,
        location: formData.location,
        languages: sanitizedLanguages,
        interests: sanitizedInterests,
      };

      const res = await fetch("/api/dashboard/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("About section updated successfully!");
      } else {
        toast.error(data.error || "Failed to update");
        console.error("Update error:", data);
      }
    } catch (error: any) {
      toast.error("Error updating");
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage.name) {
      setFormData({
        ...formData,
        languages: [
          ...formData.languages,
          {
            name: newLanguage.name,
            proficiency: proficiencyToNumber(newLanguage.proficiency),
          },
        ],
      });
      setNewLanguage({ name: "", proficiency: "intermediate" });
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index),
    });
  };

  const addInterest = () => {
    if (newInterest.name) {
      setFormData({
        ...formData,
        interests: [...formData.interests, { ...newInterest }],
      });
      setNewInterest({ name: "", icon: "" });
    }
  };

  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage About Section</h1>
      <Card>
        <CardHeader>
          <CardTitle>About Content</CardTitle>
          <CardDescription>
            Update your about section information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <DragDropImageUpload
              label="About Image"
              onFileSelect={handleFileSelect}
              currentImage={formData.image}
              onEditClick={() => {
                if (formData.image) {
                  setImageToCrop(formData.image);
                  setCropperOpen(true);
                }
              }}
              previewClassName="w-full max-w-md h-[400px] rounded-lg"
              showEditButton={!!formData.image}
            />

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Dhaka, Bangladesh"
                required
              />
            </div>

            <div>
              <Label>Languages</Label>
              <div className="space-y-4 mt-2">
                {formData.languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{lang.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {proficiencyToLabel(lang.proficiency)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeLanguage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Language name"
                    value={newLanguage.name}
                    onChange={(e) =>
                      setNewLanguage({ ...newLanguage, name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Select
                    value={newLanguage.proficiency}
                    onValueChange={(value) =>
                      setNewLanguage({ ...newLanguage, proficiency: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="native">Native</SelectItem>
                      <SelectItem value="fluent">Fluent</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addLanguage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Interests & Hobbies</Label>
              <div className="space-y-4 mt-2">
                {formData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{interest.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeInterest(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Interest name"
                    value={newInterest.name}
                    onChange={(e) =>
                      setNewInterest({ ...newInterest, name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button type="button" onClick={addInterest}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          open={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setImageToCrop("");
          }}
          onCropComplete={handleCroppedImage}
          aspectRatio={1}
        />
      )}
    </div>
  );
}
