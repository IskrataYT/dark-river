"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Laptop, Smartphone, Tablet, Globe, Clock, X, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { bg } from "date-fns/locale"

interface Browser {
  name: string
  lastUsed: string
}

interface Device {
  _id: string
  deviceName: string
  browser: string
  browsers: Browser[]
  os: string
  ip: string
  location: string
  lastLogin: string
  isCurrentDevice: boolean
}

export function DeviceManager() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user/devices")
      if (!response.ok) {
        throw new Error("Failed to fetch devices")
      }
      const data = await response.json()
      setDevices(data.devices)
    } catch (err) {
      setError("Неуспешно зареждане на устройства")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, []) //Fixed: Added empty dependency array to useEffect

  const removeDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/user/devices/${deviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove device")
      }

      // Refresh the device list
      fetchDevices()
    } catch (err) {
      setError("Неуспешно премахване на устройство")
      console.error(err)
    }
  }

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes("mobile")) {
      return <Smartphone className="h-5 w-5" />
    } else if (deviceName.toLowerCase().includes("tablet")) {
      return <Tablet className="h-5 w-5" />
    } else {
      return <Laptop className="h-5 w-5" />
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-zinc-500">Зареждане на устройства...</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {error}
        <Button variant="outline" size="sm" className="ml-2" onClick={fetchDevices}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Опитай отново
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold font-mono">УСТРОЙСТВА ЗА ДОСТЪП</h3>
        <Button variant="outline" size="sm" onClick={fetchDevices} className="text-xs">
          <RefreshCw className="h-3 w-3 mr-2" />
          Обнови
        </Button>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-4 text-zinc-500">Няма намерени устройства</div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device._id} className="border border-zinc-800 rounded-md p-4 bg-black">
              <div className="flex justify-between">
                <div className="flex items-center">
                  {getDeviceIcon(device.deviceName)}
                  <span className="ml-2 font-medium">{device.deviceName}</span>
                  {device.isCurrentDevice && (
                    <span className="ml-2 text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                      Текущо устройство
                    </span>
                  )}
                </div>
                {!device.isCurrentDevice && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDevice(device._id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-2 text-sm text-zinc-400 space-y-1">
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>
                    {device.location || "Неизвестно местоположение"} ({device.ip})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Последна активност преди{" "}
                    {formatDistanceToNow(new Date(device.lastLogin), {
                      locale: bg,
                      addSuffix: false,
                    })}
                  </span>
                </div>
              </div>

              {device.browsers && device.browsers.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium mb-1 text-zinc-500">Използвани браузъри:</h4>
                  <div className="flex flex-wrap gap-1">
                    {device.browsers.map((browser, idx) => (
                      <span key={idx} className="text-xs bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full">
                        {browser.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-zinc-600 mt-2">
        Ще получите известие, когато бъде засечен вход от ново местоположение.
      </p>
    </div>
  )
}

