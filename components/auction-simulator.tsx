"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Bidder {
  id: number
  name: string
  valuation: number
  bid: number
}

export function AuctionSimulator() {
  const [auctionType, setAuctionType] = useState<"first-price" | "second-price">("first-price")
  const [bidders, setBidders] = useState<Bidder[]>([
    { id: 1, name: "Bidder 1", valuation: 100, bid: 0 },
    { id: 2, name: "Bidder 2", valuation: 80, bid: 0 },
    { id: 3, name: "Bidder 3", valuation: 120, bid: 0 }
  ])
  const [auctionResult, setAuctionResult] = useState<{
    winner: Bidder | null
    price: number
    profit: number
  } | null>(null)

  const generateOptimalBids = () => {
    const updatedBidders = bidders.map(bidder => {
      if (auctionType === "first-price") {
        // In first-price auction, bid slightly below valuation
        return { ...bidder, bid: Math.round(bidder.valuation * 0.8) }
      } else {
        // In second-price auction, bid true valuation
        return { ...bidder, bid: bidder.valuation }
      }
    })
    setBidders(updatedBidders)
  }

  const runAuction = () => {
    const sortedBidders = [...bidders].sort((a, b) => b.bid - a.bid)
    const winner = sortedBidders[0]
    
    let price: number
    if (auctionType === "first-price") {
      price = winner.bid
    } else {
      // Second-price auction: pay second-highest bid
      price = sortedBidders[1]?.bid || winner.bid
    }

    const profit = winner.valuation - price

    setAuctionResult({ winner, price, profit })
  }

  const resetAuction = () => {
    setBidders(bidders.map(bidder => ({ ...bidder, bid: 0 })))
    setAuctionResult(null)
  }

  return (
    <div className="space-y-4">
      {/* Auction Type Selection */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">Auction Type:</div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={auctionType === "first-price" ? "default" : "outline"}
            size="sm"
            onClick={() => setAuctionType("first-price")}
          >
            First-Price Sealed Bid
          </Button>
          <Button
            variant={auctionType === "second-price" ? "default" : "outline"}
            size="sm"
            onClick={() => setAuctionType("second-price")}
          >
            Second-Price Sealed Bid
          </Button>
        </div>
      </div>

      {/* Bidders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bidders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bidders.map((bidder) => (
              <div key={bidder.id} className="grid grid-cols-3 gap-2 text-xs">
                <div className="font-semibold">{bidder.name}</div>
                <div>Value: ${bidder.valuation}</div>
                <div>Bid: ${bidder.bid}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={generateOptimalBids}>
          Generate Optimal Bids
        </Button>
        <Button size="sm" onClick={runAuction} disabled={bidders.every(b => b.bid === 0)}>
          Run Auction
        </Button>
      </div>

      {/* Results */}
      {auctionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Auction Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Winner:</strong> {auctionResult.winner?.name}</div>
              <div><strong>Price Paid:</strong> ${auctionResult.price}</div>
              <div><strong>Winner&apos;s Profit:</strong> ${auctionResult.profit}</div>
              <div className="text-xs text-muted-foreground mt-2">
                {auctionType === "first-price" 
                  ? "Winner pays their bid amount"
                  : "Winner pays second-highest bid (Vickrey auction)"
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" size="sm" onClick={resetAuction}>
        Reset
      </Button>
    </div>
  )
}