import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar, Settings as Setting, Shield, Users } from 'lucide-react'
import { Button } from '../ui/button'

export default function Settings() {
  return (
   
          <Card className="animate-in slide-in-from-right duration-700 delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Setting className="w-5 h-5 text-orange-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200">
                <Calendar className="w-4 h-4 mr-2" />
                View Reports
              </Button>
              <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200">
                <Setting className="w-4 h-4 mr-2" />
                System Settings
              </Button>
              <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200">
                <Shield className="w-4 h-4 mr-2" />
                Security Center
              </Button>
            </CardContent>
          </Card>
 
  )
}
