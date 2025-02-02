import { ArrowLeftCircle, Settings, Terminal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface ApiSidebarProps {
  storeName: string;
}

export function ApiSidebar({ storeName }: ApiSidebarProps) {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Voltar",
      icon: ArrowLeftCircle,
      onClick: () => navigate("/"),
    },
    {
      title: "API Tester",
      icon: Terminal,
      onClick: () => {},
      active: true,
    },
    {
      title: "Configurações",
      icon: Settings,
      onClick: () => {},
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center justify-between p-4">
          <SidebarTrigger />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>{storeName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={item.onClick}
                    data-active={item.active}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}