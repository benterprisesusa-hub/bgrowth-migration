import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Inbox, 
  Briefcase, 
  Users, 
  Settings, 
  UserSquare2, 
  MessageSquare, 
  UserPlus, 
  ClipboardCheck, 
  Truck, 
  Car, 
  UserCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { AppSettings, BookingRequest, JobOffer, TeamMember, Application } from '../types';

interface AppHubProps {
  settings: AppSettings;
  requests: BookingRequest[];
  offers: JobOffer[];
  members: TeamMember[];
  apps: Application[];
  setActiveTab: (tab: string) => void;
}

export default function AppHub({ 
  settings, 
  requests, 
  offers, 
  members, 
  apps, 
  setActiveTab 
}: AppHubProps) {
  
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const openOffers = offers.filter(o => o.status === 'open').length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const pendingCandidates = apps.length;

  const enabledModules = settings.enabledModules || { cleaning: true, delivery: true, mileage: true };

  const appCategories = [
    ...(enabledModules.cleaning ? [{
      title: "Administração & Operações (Limpeza)",
      description: "Console administrativo para gerenciar serviços, escalas e clientes de faxina.",
      color: "border-sky-500/10 hover:border-sky-500/30",
      iconColor: "text-sky-500 bg-sky-500/10",
      items: [
        {
          id: 'dashboard',
          name: 'Dashboard Geral',
          desc: 'Visão macro do negócio, faturamento estimado, taxas de conversão e gráficos de desempenho.',
          icon: LayoutDashboard,
          badge: null,
          actionText: 'Abrir Painel'
        },
        {
          id: 'booking-requests',
          name: 'Gestão de Reservas',
          desc: 'Aprovação e triagem de solicitações de agendamento recebidas de clientes.',
          icon: Inbox,
          badge: pendingRequests > 0 ? `${pendingRequests} pendentes` : null,
          badgeColor: 'bg-amber-500/15 text-amber-400',
          actionText: 'Revisar Reservas'
        },
        {
          id: 'cleaning-schedule',
          name: 'Agenda de Faxinas',
          desc: 'Calendário interativo mensal, escala de diaristas e cadastro direto de novos serviços de limpeza (New Job).',
          icon: Calendar,
          badge: 'Calendário',
          badgeColor: 'bg-teal-500/15 text-teal-400',
          actionText: 'Abrir Agenda'
        },
        {
          id: 'job-board',
          name: 'Quadro de Serviços',
          desc: 'Criação, escala, envio de propostas automáticas e atribuição de diaristas.',
          icon: Briefcase,
          badge: openOffers > 0 ? `${openOffers} abertas` : null,
          badgeColor: 'bg-emerald-500/15 text-emerald-400',
          actionText: 'Gerenciar Vagas'
        },
        {
          id: 'team-payroll',
          name: 'Equipe & Pagamentos',
          desc: 'Cadastro de profissionais, controle de folhas de pagamento e faturas de comissão.',
          icon: Users,
          badge: activeMembers > 0 ? `${activeMembers} ativos` : null,
          badgeColor: 'bg-indigo-500/15 text-indigo-400',
          actionText: 'Ver Equipe'
        },
        {
          id: 'clients',
          name: 'Banco de Clientes (CRM)',
          desc: 'Base de dados de clientes, endereços, preferências e histórico de atendimentos.',
          icon: UserSquare2,
          badge: null,
          actionText: 'Acessar Clientes'
        }
      ]
    }] : []),
    ...(enabledModules.cleaning ? [{
      title: "Portais de Funcionários & Clientes (Limpeza)",
      description: "Links externos e portais públicos de interação para clientes e equipe de campo.",
      color: "border-teal-500/10 hover:border-teal-500/30",
      iconColor: "text-teal-500 bg-teal-500/10",
      items: [
        {
          id: 'booking-form',
          name: 'Formulário de Agendamento',
          desc: 'Link de agendamento público onde clientes simulam preços e contratam serviços.',
          icon: PlusCircle,
          badge: 'Público',
          badgeColor: 'bg-teal-500/15 text-teal-400',
          actionText: 'Ver Formulário'
        },
        {
          id: 'live-portal',
          name: 'Portal do Cliente Live',
          desc: 'Acompanhamento interativo do serviço, chat, avaliação e status do diarista em tempo real.',
          icon: MessageSquare,
          badge: 'Live',
          badgeColor: 'bg-indigo-500/15 text-indigo-400',
          actionText: 'Ver Portal'
        },
        {
          id: 'recruitment',
          name: 'Trabalhe Conosco',
          desc: 'Formulário externo para novos profissionais de limpeza se candidatarem à equipe.',
          icon: UserPlus,
          badge: 'Candidaturas',
          badgeColor: 'bg-slate-500/20 text-slate-400',
          actionText: 'Ver Página'
        },
        {
          id: 'onboarding',
          name: 'Onboarding de Candidatos',
          desc: 'Processo seletivo, checklist de documentos e simulação de contratação profissional.',
          icon: UserCheck,
          badge: pendingCandidates > 0 ? `${pendingCandidates} novos` : null,
          badgeColor: 'bg-rose-500/15 text-rose-400',
          actionText: 'Iniciar Treino'
        },
        {
          id: 'worker-portal',
          name: 'Portal do Profissional',
          desc: 'Área do prestador para aceitar vagas, atualizar checklists de limpeza e solicitar pagamentos.',
          icon: ClipboardCheck,
          badge: 'Restrito',
          badgeColor: 'bg-amber-500/15 text-amber-400',
          actionText: 'Entrar no Portal'
        }
      ]
    }] : []),
    {
      title: "Finanças, Logística & Ajustes",
      description: "Utilitários integrados de controle fiscal, rotas e configurações gerais da BGrowth Platform™.",
      color: "border-fuchsia-500/10 hover:border-fuchsia-500/30",
      iconColor: "text-fuchsia-500 bg-fuchsia-500/10",
      items: [
        ...(enabledModules.delivery ? [{
          id: 'delivery-tracker',
          name: 'Logística de Entregas',
          desc: 'Planejamento de rotas e status de entregas de kits e pedidos aos diaristas ou motoristas de delivery.',
          icon: Truck,
          badge: 'Rotas Active',
          badgeColor: 'bg-sky-500/15 text-sky-400',
          actionText: 'Rastrear Entregas'
        }] : []),
        ...(enabledModules.mileage ? [{
          id: 'mileage-tracker',
          name: 'Rastreador de Quilometragem',
          desc: 'Log de odômetros integrado para abatimento tributário de imposto de renda (IRS / Tax Deductions).',
          icon: Car,
          badge: 'IRS Active',
          badgeColor: 'bg-emerald-500/15 text-emerald-400',
          actionText: 'Lançar Milhas'
        }] : []),
        {
          id: 'settings',
          name: 'Ajustes de Módulos (SaaS)',
          desc: 'Configure o perfil da empresa, planos de subscrição ativos, tarifas e preferências do sistema.',
          icon: Settings,
          badge: 'SaaS Config',
          badgeColor: 'bg-indigo-500/15 text-indigo-400',
          actionText: 'Configurar'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Banner / Hero Principal */}
      <div className="relative bg-slate-900 rounded-3xl p-8 text-white overflow-hidden shadow-xl shadow-slate-950/20 border border-slate-800">
        {/* Efeito visual de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[11px] font-black uppercase tracking-wider border border-teal-500/20">
            <Compass size={12} />
            Central de Aplicativos BGrowth Platform™
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">
              {settings.bizProfile?.name || "BGrowth Platform™"}
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {!enabledModules.cleaning && enabledModules.delivery 
                ? "Sua plataforma unificada de Logística de Entregas (Delivery Tracker) e dedução de impostos de viagem (Mileage Tracker). Ative outros módulos comerciais nas Configurações SaaS."
                : "Bem-vindo à sua central operacional modular. Gerencie suas verticais de negócio contratadas com reutilização de dados, consistência de design e sincronização fiscal de ponta a ponta."}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          {enabledModules.cleaning && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 animate-fade-in">
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Agendamentos Pendentes</span>
                <span className="text-lg font-black text-white block mt-0.5">{pendingRequests}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Serviços Disponíveis</span>
                <span className="text-lg font-black text-teal-400 block mt-0.5">{openOffers}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Profissionais Ativos</span>
                <span className="text-lg font-black text-white block mt-0.5">{activeMembers}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Novas candidaturas</span>
                <span className="text-lg font-black text-rose-400 block mt-0.5">{pendingCandidates}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Categorias de Apps */}
      <div className="space-y-8">
        {appCategories.map((category) => (
          <div key={category.title} className="space-y-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">{category.title}</h2>
              <p className="text-xs text-slate-500 font-medium">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((app) => {
                const Icon = app.icon;
                return (
                  <div 
                    key={app.id} 
                    onClick={() => setActiveTab(app.id)}
                    className={`group bg-white border ${category.color} rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all duration-200 cursor-pointer relative overflow-hidden`}
                    id={`app-card-${app.id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.iconColor}`}>
                          <Icon size={18} />
                        </div>
                        {app.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${app.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                            {app.badge}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-teal-500 transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                          {app.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto flex items-center gap-1 text-[11px] font-black text-slate-500 group-hover:text-teal-500 transition-colors">
                      <span>{app.actionText}</span>
                      <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé de Informação do Sistema */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-semibold text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>BGrowth Suite &bull; Todos os microsserviços integrados e autenticados de ponta a ponta</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 font-bold">
          <CheckCircle2 size={12} className="text-teal-500" />
          <span>Última sincronização de dados: Hoje</span>
        </div>
      </div>

    </div>
  );
}
