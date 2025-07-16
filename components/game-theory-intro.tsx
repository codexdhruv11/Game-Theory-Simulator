"use client"

import { Card, CardContent } from "@/components/ui/card"

export function GameTheoryIntro() {
  return (
    <div className="space-y-4">
      <div className="text-sm space-y-3">
        <p>
          <strong>Game Theory</strong> is the mathematical study of strategic decision-making 
          among rational agents.
        </p>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Key Concepts:</h4>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Players:</strong> Decision makers</li>
            <li>• <strong>Strategies:</strong> Available actions</li>
            <li>• <strong>Payoffs:</strong> Outcomes/utilities</li>
            <li>• <strong>Nash Equilibrium:</strong> Stable strategy profile</li>
          </ul>
        </div>
        
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <p className="text-xs italic">
              &quot;The best strategy depends on what others do.&quot;
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}