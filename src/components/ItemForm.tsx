
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useItemsStore } from "@/store/itemsStore";
import { toast } from "@/components/ui/use-toast";

export const ItemForm = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const addItem = useItemsStore((state) => state.addItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === "" || location.trim() === "") {
      return toast({
        title: "Error",
        description: "Item name and location are required",
        variant: "destructive",
      });
    }
    
    addItem(name.trim(), location.trim());
    toast({
      title: "Item Added",
      description: `${name} is now at ${location}`,
    });
    
    // Reset form
    setName("");
    setLocation("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">Item Name</Label>
          <Input
            id="item-name"
            placeholder="e.g. Keys, Wallet, Phone"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="item-location">Location</Label>
          <Input
            id="item-location"
            placeholder="e.g. Kitchen drawer, Bedroom table"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        Add Item
      </Button>
    </form>
  );
};
