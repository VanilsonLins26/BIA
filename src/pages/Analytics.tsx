import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { readMetrics, type Metrics } from "@/lib/metrics";
import { BarChart3, MessageCircle, MousePointer, Smartphone, ThumbsUp, ThumbsDown, RefreshCw, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Session } from "@supabase/supabase-js";

type SnapshotRow = {
  event_name: string;
  count: number;
  snapshot_date: string;
};

const Analytics = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setLoading(false);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" })
        .then(({ data }) => {
          setIsAdmin(!!data);
          setLoading(false);
        });
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    setRefreshing(true);
    const [m, snaps] = await Promise.all([
      readMetrics(),
      supabase
        .from("metric_snapshots")
        .select("event_name, count, snapshot_date")
        .order("snapshot_date", { ascending: true }),
    ]);
    setMetrics(m);
    if (snaps.data) setSnapshots(snaps.data as SnapshotRow[]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container text-center text-muted-foreground">Carregando...</div>
      </section>
    );
  }

  if (!session) {
    navigate("/auth");
    return null;
  }

  if (isAdmin === false) {
    return (
      <section className="py-20">
        <div className="container text-center text-muted-foreground">
          <p className="text-lg font-medium text-foreground mb-2">Acesso restrito</p>
          <p>Esta página é exclusiva para administradores.</p>
        </div>
      </section>
    );
  }

  // Build chart data: pivot snapshots by date
  const chartData = (() => {
    const dateMap: Record<string, Record<string, number>> = {};
    for (const row of snapshots) {
      if (!dateMap[row.snapshot_date]) dateMap[row.snapshot_date] = {};
      dateMap[row.snapshot_date][row.event_name] = row.count;
    }
    return Object.entries(dateMap)
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        Acessos: values.pageViews || 0,
        Conversas: values.chatStarted || 0,
        Interações: values.chatInteractions || 0,
        Instalações: values.installClicks || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

  const items = metrics
    ? [
        { icon: MousePointer, label: "Acessos ao site", value: metrics.pageViews },
        { icon: MessageCircle, label: "Conversas iniciadas", value: metrics.chatStarted },
        { icon: BarChart3, label: "Interações com o bot", value: metrics.chatInteractions },
        { icon: Smartphone, label: "Cliques em instalar", value: metrics.installClicks },
        { icon: ThumbsUp, label: "Avaliações positivas", value: metrics.npsPositive },
        { icon: ThumbsDown, label: "Avaliações negativas", value: metrics.npsNegative },
        { icon: ThumbsUp, label: "Perfis criados", value: metrics.profile_created },
        { icon: ThumbsDown, label: "Perfis pulados", value: metrics.profile_skipped },
        { icon: BarChart3, label: "Avatares selecionados", value: metrics.avatar_selected },
      ]
    : [];

  return (
    <section className="py-20">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            className="text-3xl font-display font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Métricas do Projeto
          </motion.h1>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Atualizar"
            >
              <RefreshCw size={20} className={`text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Sair"
            >
              <LogOut size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Logado como <span className="font-medium text-foreground">{session.user.email}</span>
        </p>

        {!metrics ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {items.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="bg-card rounded-3xl p-5 guardian-glow text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <item.icon size={24} className="mx-auto text-primary mb-2" />
                  <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Time series chart */}
            {chartData.length > 0 && (
              <motion.div
                className="bg-card rounded-3xl p-6 guardian-glow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="font-display font-semibold text-foreground mb-4">
                  Evolução Temporal
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(270 15% 90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(270 10% 45%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(270 10% 45%)" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(0 0% 100%)",
                        border: "1px solid hsl(270 15% 90%)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Acessos" stroke="#C9A4E8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Conversas" stroke="#F5B7D3" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Interações" stroke="#9b6cc4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Instalações" stroke="#e896b8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Analytics;
