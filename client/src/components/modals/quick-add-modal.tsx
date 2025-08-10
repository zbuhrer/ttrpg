import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, MapPin, Users, Scroll } from "lucide-react";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const quickAddOptions = [
    {
      icon: UserPlus,
      title: "Add Character",
      description: "Create a new player character",
      action: () => {
        // TODO: Navigate to character creation
        onClose();
      }
    },
    {
      icon: MapPin,
      title: "Add Location",
      description: "Create a new world location",
      action: () => {
        // TODO: Navigate to location creation
        onClose();
      }
    },
    {
      icon: Users,
      title: "Add NPC",
      description: "Create a non-player character",
      action: () => {
        // TODO: Navigate to NPC creation
        onClose();
      }
    },
    {
      icon: Scroll,
      title: "Add Quest",
      description: "Create a new quest or objective",
      action: () => {
        // TODO: Navigate to quest creation
        onClose();
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-md">
        <DialogHeader className="border-b border-fantasy-charcoal pb-4">
          <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
            Quick Add
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {quickAddOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.title}
                onClick={option.action}
                variant="ghost"
                className="w-full p-4 bg-fantasy-dark/30 hover:bg-fantasy-primary/20 border border-fantasy-charcoal rounded-lg text-left transition-colors duration-300 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="text-fantasy-accent w-5 h-5" />
                  <div>
                    <p className="font-medium text-white">{option.title}</p>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
