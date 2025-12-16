"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
}

export function MembersSection() {
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "Alice Johnson", email: "alice@example.com" },
    { id: "2", name: "Bob Smith", email: "bob@example.com" },
  ]);
  const [newMember, setNewMember] = useState({ name: "", email: "" });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;
    setMembers((prev) => [
      ...prev,
      { id: Date.now().toString(), ...newMember },
    ]);
    setNewMember({ name: "", email: "" });
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Card className="rounded-xl border shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMember(member.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}

          {/* Add new member form */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Input
              placeholder="Full name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
            />
            <Input
              placeholder="Email address"
              value={newMember.email}
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
              }
            />
            <Button onClick={handleAddMember}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
