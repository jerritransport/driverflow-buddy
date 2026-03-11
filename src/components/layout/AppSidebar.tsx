import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Settings, 
  LogOut,
  Truck,
  Shield,
  GraduationCap,
  BarChart3,
  Calendar,
  FileText,
  FlaskConical,
  
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const allNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/', adminOnly: false },
  { title: 'Drivers', icon: Users, path: '/drivers', adminOnly: false },
  { title: 'Follow-Ups', icon: Calendar, path: '/follow-ups', adminOnly: false },
  { title: 'Intake Forms', icon: FileText, path: '/intake-forms', adminOnly: true },
  { title: 'SAPs', icon: Stethoscope, path: '/saps', adminOnly: true },
  { title: 'Test Results', icon: FlaskConical, path: '/test-results', adminOnly: true },
  { title: 'Reports', icon: BarChart3, path: '/reports', adminOnly: true },
  { title: 'My Settings', icon: Settings, path: '/my-settings', studentOnly: true },
];

const adminNavItems = [
  { title: 'Students', icon: GraduationCap, path: '/students' },
  { title: 'Admin', icon: Shield, path: '/admin' },
  { title: 'Settings', icon: Settings, path: '/settings' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, isStudent, user } = useAuth();

  const mainNavItems = allNavItems.filter(item => !item.adminOnly || !isStudent);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">RTD Dashboard</h2>
            <p className="text-xs text-sidebar-foreground/70">Driver Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.email}
            </p>
            <p className="text-xs capitalize text-sidebar-foreground/70">
              {isAdmin ? 'Administrator' : isStudent ? 'Student' : 'Staff'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
