import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeSlot {
  id: string;
  time: string;
}

const DAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

export function ScheduleConfig() {
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "wed", "fri"]);
  const [postsPerDay, setPostsPerDay] = useState([3]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: "1", time: "09:00" },
    { id: "2", time: "14:00" },
    { id: "3", time: "19:00" },
  ]);

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const addTimeSlot = () => {
    setTimeSlots((prev) => [
      ...prev,
      { id: Date.now().toString(), time: "12:00" },
    ]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const updateTimeSlot = (id: string, time: string) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, time } : slot))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posting Schedule</CardTitle>
        <CardDescription>
          Configure when and how often you want to post
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Days of the Week</Label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <Button
                key={day.id}
                variant={selectedDays.includes(day.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDay(day.id)}
                className="toggle-elevate"
                data-active={selectedDays.includes(day.id)}
                data-testid={`button-day-${day.id}`}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Posts Per Day: {postsPerDay[0]}</Label>
          </div>
          <Slider
            value={postsPerDay}
            onValueChange={setPostsPerDay}
            min={1}
            max={10}
            step={1}
            data-testid="slider-posts-per-day"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Posting Times</Label>
            <Button size="sm" onClick={addTimeSlot} data-testid="button-add-time">
              <Plus className="h-4 w-4 mr-1" />
              Add Time
            </Button>
          </div>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="flex gap-2">
                <Select
                  value={slot.time}
                  onValueChange={(value) => updateTimeSlot(slot.id, value)}
                >
                  <SelectTrigger className="flex-1" data-testid={`select-time-${slot.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0");
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeTimeSlot(slot.id)}
                  disabled={timeSlots.length === 1}
                  data-testid={`button-remove-time-${slot.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium mb-1">Schedule Summary</p>
          <p className="text-sm text-muted-foreground">
            {selectedDays.length} days per week · {postsPerDay[0]} posts per day · {timeSlots.length} time slots
          </p>
        </div>

        <Button className="w-full" data-testid="button-save-schedule">
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
}
