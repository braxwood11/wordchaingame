import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export default function TestComponents() {
  return (
    <Card className="w-full max-w-md mx-auto mt-8 bg-white shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-blue-600">Component Test Page</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <Input 
          placeholder="Type something here..." 
          className="border-gray-300 focus:border-blue-500"
        />
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Click Me!
        </Button>
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-700">
            This is a test alert message!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
