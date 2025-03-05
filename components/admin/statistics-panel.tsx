"use client"

import { useState, useEffect } from "react"
import {
  Users,
  MessageSquare,
  FileText,
  Heart,
  AlertTriangle,
  Shield,
  Clock,
  Activity,
  Zap,
  BarChart,
  LineChart,
  Timer,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PlatformStats {
  totalUsers: number
  activeUsers: number
  totalMessages: number
  totalNotes: number
  totalDonors: number
  totalWarnings: number
  bannedUsers: number
  mutedUsers: number
  registrationsLastWeek: number
  messagesLastWeek: number
  userRetentionRate: number
  averageMessagesPerUser: number
  topActiveUsers: { name: string; messageCount: number }[]
  stageCompletionRates: { stage: number; completionRate: number }[]
  hourlyActivity: number[]
  // Enhanced statistics
  retentionByAge: { ageRange: string; retentionRate: number }[]
  timeInStage: { stage: number; avgDays: number }[]
  // Vercel analytics
  performance?: {
    lcp: { average: number; p75: number }
    fid: { average: number; p75: number }
    cls: { average: number; p75: number }
    ttfb: { average: number; p75: number }
    fcp: { average: number; p75: number }
  }
  pageViews?: {
    total: number
    unique: number
    lastWeek: number
  }
  topPages?: { path: string; views: number }[]
  bounceRate?: number
  avgSessionDuration?: number
}

export function StatisticsPanel() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/statistics")

        if (!response.ok) {
          throw new Error("Failed to fetch statistics")
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching statistics:", error)
        setError("Failed to load platform statistics. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-pulse bg-zinc-800 h-8 w-20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950/20 p-4 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  // If we don't have stats yet, show placeholder data
  const displayStats = stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalNotes: 0,
    totalDonors: 0,
    totalWarnings: 0,
    bannedUsers: 0,
    mutedUsers: 0,
    registrationsLastWeek: 0,
    messagesLastWeek: 0,
    userRetentionRate: 0,
    averageMessagesPerUser: 0,
    topActiveUsers: [],
    stageCompletionRates: [],
    hourlyActivity: Array(24).fill(0),
    retentionByAge: [],
    timeInStage: [],
    performance: undefined,
    pageViews: undefined,
    topPages: undefined,
    bounceRate: undefined,
    avgSessionDuration: undefined,
  }

  // Helper function to format time in seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-zinc-900 border border-zinc-800">
        <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
          Общ преглед
        </TabsTrigger>
        <TabsTrigger value="users" className="data-[state=active]:bg-zinc-800">
          Потребители
        </TabsTrigger>
        <TabsTrigger value="content" className="data-[state=active]:bg-zinc-800">
          Съдържание
        </TabsTrigger>
        <TabsTrigger value="performance" className="data-[state=active]:bg-zinc-800">
          Производителност
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <Users className="mr-2 h-4 w-4" />
                ПОТРЕБИТЕЛИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalUsers}</div>
              <p className="text-xs text-zinc-500 mt-1">{displayStats.activeUsers} активни през последните 7 дни</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                СЪОБЩЕНИЯ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalMessages}</div>
              <p className="text-xs text-zinc-500 mt-1">{displayStats.messagesLastWeek} нови през последните 7 дни</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                БЕЛЕЖКИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalNotes}</div>
              <p className="text-xs text-zinc-500 mt-1">
                Средно {Math.round((displayStats.totalNotes / Math.max(displayStats.totalUsers, 1)) * 10) / 10} на
                потребител
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                ДАРИТЕЛИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalDonors}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {((displayStats.totalDonors / Math.max(displayStats.totalUsers, 1)) * 100).toFixed(1)}% от всички
                потребители
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                ПРЕДУПРЕЖДЕНИЯ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalWarnings}</div>
              <p className="text-xs text-zinc-500 mt-1">{displayStats.mutedUsers} заглушени потребители в момента</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                БЛОКИРАНИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.bannedUsers}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {((displayStats.bannedUsers / Math.max(displayStats.totalUsers, 1)) * 100).toFixed(1)}% от всички
                потребители
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Activity Chart */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 text-sm font-mono">АКТИВНОСТ ПО ЧАСОВЕ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px] flex items-end justify-between gap-1">
              {displayStats.hourlyActivity.map((count, hour) => {
                // Find the maximum value to normalize the heights
                const maxCount = Math.max(...displayStats.hourlyActivity, 1)
                const heightPercentage = (count / maxCount) * 100

                return (
                  <div key={hour} className="w-full">
                    <div
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
            <div className="text-center text-xs text-zinc-500 mt-1">Час на деня</div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Users Tab */}
      <TabsContent value="users" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* User Retention Rate */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <Users className="mr-2 h-4 w-4" />
                ЗАДЪРЖАНЕ НА ПОТРЕБИТЕЛИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.userRetentionRate}%</div>
              <p className="text-xs text-zinc-500 mt-1">Процент на активните потребители</p>

              <h4 className="text-xs text-zinc-400 mt-4 mb-2">По възраст на акаунта</h4>
              <div className="space-y-2">
                {displayStats.retentionByAge.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">{item.ageRange}</span>
                    <div className="w-2/3 bg-zinc-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.retentionRate}%` }}></div>
                    </div>
                    <span className="text-xs text-zinc-400">{item.retentionRate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Active Users */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono">НАЙ-АКТИВНИ ПОТРЕБИТЕЛИ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayStats.topActiveUsers.length > 0 ? (
                  displayStats.topActiveUsers.map((user, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs text-zinc-400">{user.name}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-zinc-800 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (user.messageCount / (displayStats.topActiveUsers[0]?.messageCount || 1)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-zinc-500">{user.messageCount}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Няма данни за активни потребители</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Activity */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              АКТИВНОСТ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500">Нови регистрации (7 дни)</span>
                <span className="text-xs font-medium">{displayStats.registrationsLastWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500">Нови съобщения (7 дни)</span>
                <span className="text-xs font-medium">{displayStats.messagesLastWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500">Съобщения/потребител</span>
                <span className="text-xs font-medium">{displayStats.averageMessagesPerUser}</span>
              </div>
              {displayStats.avgSessionDuration && (
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500">Средно време на сесия</span>
                  <span className="text-xs font-medium">{formatTime(displayStats.avgSessionDuration)}</span>
                </div>
              )}
              {displayStats.bounceRate !== undefined && (
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500">Процент на отпадане</span>
                  <span className="text-xs font-medium">{displayStats.bounceRate}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Content Tab */}
      <TabsContent value="content" className="space-y-6">
        {/* Stage Completion Rates */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              ЕТАПИ НА ПРОГРЕС
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayStats.stageCompletionRates.map((rate, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500">Етап {rate.stage}</span>
                  <div className="w-2/3 bg-zinc-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${rate.completionRate}%` }}></div>
                  </div>
                  <span className="text-xs text-zinc-400">{rate.completionRate}%</span>
                </div>
              ))}
            </div>

            {displayStats.timeInStage.length > 0 && (
              <>
                <h4 className="text-xs text-zinc-400 mt-4 mb-2">Средно време в етап (дни)</h4>
                <div className="space-y-2">
                  {displayStats.timeInStage.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-xs text-zinc-500">Етап {item.stage}</span>
                      <span className="text-xs text-zinc-400">{item.avgDays} дни</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        {displayStats.topPages && (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                НАЙ-ПОСЕЩАВАНИ СТРАНИЦИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayStats.topPages.map((page, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 truncate max-w-[200px]">{page.path}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-zinc-800 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (page.views / (displayStats.topPages?.[0]?.views || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-zinc-500">{page.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Page Views */}
        {displayStats.pageViews && (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                ПРЕГЛЕЖДАНИЯ НА СТРАНИЦИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.pageViews.total}</div>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500">Уникални посетители</span>
                  <span className="text-xs font-medium">{displayStats.pageViews.unique}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500">Последни 7 дни</span>
                  <span className="text-xs font-medium">{displayStats.pageViews.lastWeek}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Performance Tab */}
      <TabsContent value="performance" className="space-y-6">
        {displayStats.performance ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Core Web Vitals */}
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                    <Zap className="mr-2 h-4 w-4" />
                    LCP
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Largest Contentful Paint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.performance.lcp.average}ms</div>
                  <p className="text-xs text-zinc-500 mt-1">P75: {displayStats.performance.lcp.p75}ms</p>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        displayStats.performance.lcp.p75 < 2500
                          ? "bg-green-500"
                          : displayStats.performance.lcp.p75 < 4000
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (displayStats.performance.lcp.p75 / 4000) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                    <Zap className="mr-2 h-4 w-4" />
                    FID
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">First Input Delay</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.performance.fid.average}ms</div>
                  <p className="text-xs text-zinc-500 mt-1">P75: {displayStats.performance.fid.p75}ms</p>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        displayStats.performance.fid.p75 < 100
                          ? "bg-green-500"
                          : displayStats.performance.fid.p75 < 300
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (displayStats.performance.fid.p75 / 300) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                    <Zap className="mr-2 h-4 w-4" />
                    CLS
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Cumulative Layout Shift</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.performance.cls.average}</div>
                  <p className="text-xs text-zinc-500 mt-1">P75: {displayStats.performance.cls.p75}</p>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        displayStats.performance.cls.p75 < 0.1
                          ? "bg-green-500"
                          : displayStats.performance.cls.p75 < 0.25
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (displayStats.performance.cls.p75 / 0.25) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Additional Performance Metrics */}
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                    <Timer className="mr-2 h-4 w-4" />
                    TTFB
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Time to First Byte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.performance.ttfb.average}ms</div>
                  <p className="text-xs text-zinc-500 mt-1">P75: {displayStats.performance.ttfb.p75}ms</p>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        displayStats.performance.ttfb.p75 < 200
                          ? "bg-green-500"
                          : displayStats.performance.ttfb.p75 < 500
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (displayStats.performance.ttfb.p75 / 500) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-400 text-sm font-mono flex items-center">
                    <LineChart className="mr-2 h-4 w-4" />
                    FCP
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">First Contentful Paint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.performance.fcp.average}ms</div>
                  <p className="text-xs text-zinc-500 mt-1">P75: {displayStats.performance.fcp.p75}ms</p>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        displayStats.performance.fcp.p75 < 1800
                          ? "bg-green-500"
                          : displayStats.performance.fcp.p75 < 3000
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (displayStats.performance.fcp.p75 / 3000) * 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-zinc-400 text-sm font-mono">ПРОИЗВОДИТЕЛНОСТ</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Данни от Vercel Speed Insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400">
                    Core Web Vitals са ключови метрики за производителност, които измерват потребителското изживяване на
                    вашия сайт.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-zinc-900 p-2 rounded-md">
                      <p className="text-xs text-zinc-500">Добро</p>
                      <div className="w-full h-1 bg-green-500 mt-1"></div>
                    </div>
                    <div className="bg-zinc-900 p-2 rounded-md">
                      <p className="text-xs text-zinc-500">Нуждае се от подобрение</p>
                      <div className="w-full h-1 bg-yellow-500 mt-1"></div>
                    </div>
                    <div className="bg-zinc-900 p-2 rounded-md">
                      <p className="text-xs text-zinc-500">Лошо</p>
                      <div className="w-full h-1 bg-red-500 mt-1"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <p className="text-zinc-400 text-center">
                Няма налични данни за производителност. Свържете Vercel Speed Insights за подробна информация.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}

