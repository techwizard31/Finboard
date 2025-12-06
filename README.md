## 🌐 Real-time Updates with WebSocket

FinBoard now supports real-time stock price updates via WebSocket connections powered by Socket.IO and Finnhub.

### How It Works

1. **WebSocket Server**: Next.js custom server with Socket.IO attached
2. **Client Connection**: Automatic connection on page load
3. **Symbol Subscription**: Widgets subscribe to specific stock symbols
4. **Finnhub Integration**: Server connects to Finnhub WebSocket for real-time data
5. **Live Updates**: Stock prices update instantly without polling

### Enabling Real-time Updates

1. Make sure you have a valid **Finnhub API key** in `.env.local`
2. When adding or configuring a widget, toggle "Enable Real-time Updates"
3. Look for the 🔴 LIVE indicator on widgets with active WebSocket connections
4. Real-time updates work for Card and Chart widgets (not Table widgets)

### Features

- **Instant Updates**: Stock prices update in real-time (< 1 second latency)
- **Visual Indicators**: Live badge and pulse animations
- **Flash Effects**: Widgets flash when prices change
- **Connection Status**: See WebSocket connection state in config panel
- **Auto-reconnection**: Automatic reconnection on disconnect
- **Fallback**: Falls back to polling if WebSocket unavailable

### Troubleshooting

**WebSocket not connecting:**
- Check that your Finnhub API key is valid
- Ensure `FINNHUB_API_KEY` is set in `.env.local`
- Restart the development server after adding the key
- Check browser console for connection errors

**No real-time updates:**
- Verify the "Enable Real-time Updates" toggle is ON
- Check that the LIVE indicator is showing on the widget
- Ensure the stock symbol is valid and traded on US exchanges
- Some stocks may have limited real-time data availability