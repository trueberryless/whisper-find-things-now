
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceInput } from "@/components/VoiceInput";
import { ItemForm } from "@/components/ItemForm";
import { ItemsList } from "@/components/ItemsList";
import { MapPin, Mic } from "lucide-react";

const Index = () => {
  return (
    <div className="container max-w-4xl mx-auto py-4 px-4 sm:py-8 sm:px-6">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-primary" /> Find Things
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Keep track of where you put your belongings so you never lose them again.
          </p>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Voice Assistant</CardTitle>
            </div>
            <CardDescription>
              Try saying "I put my wallet in the desk drawer"
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <VoiceInput />
          </CardContent>
        </Card>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="items">Your Items</TabsTrigger>
            <TabsTrigger value="add">Add Manually</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items">
            <ItemsList />
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Item</CardTitle>
                <CardDescription>
                  Manually add an item and its location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ItemForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
