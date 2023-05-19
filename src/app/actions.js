import App from 'ampersand-app'

import AuthActions from 'actions/auth'
import IntegrationActions from 'actions/integrations'
import CustomerActions from 'actions/customer'
import DashboardActions from 'actions/dashboard'
import FileActions from 'actions/file'
import ScriptActions from 'actions/script'
import HostActions from 'actions/host'
import IndicatorActions from 'actions/indicator'
import JobActions from 'actions/job'
import MarketplaceActions from 'actions/marketplace'
import MemberActions from 'actions/member'
import MonitorActions from 'actions/monitor'
import NavbarActions from 'actions/navbar'
import NotificationActions from 'actions/notifications'
import OnHoldActions from 'actions/onHold'
import PopupActions from 'actions/popup'
import ResourceActions from 'actions/resource'
import SchedulerActions from 'actions/schedule'
import SearchBoxActions from 'actions/searchbox'
import SessionActions from 'actions/session'
import SettingsMenuActions from 'actions/settings-menu'
import GroupsActions from 'actions/groups'
import TabsActions from 'actions/tabs'
import TaskActions from 'actions/task'
import TokenActions from 'actions/token'
import WorkflowActions from 'actions/workflow'
import UserActions from 'actions/user'
import OnboardingActions from 'actions/onboarding'
import LocalSettingsActions from 'actions/local-settings'
import RoleActions from 'actions/role'

export default {
  actions: {
    auth: AuthActions,
    customer: CustomerActions,
    dashboard: DashboardActions,
    file: FileActions,
    host: HostActions,
    indicator: IndicatorActions,
    integrations: IntegrationActions,
    job: JobActions,
    localSettings: LocalSettingsActions,
    marketplace: MarketplaceActions,
    member: MemberActions,
    monitor: MonitorActions,
    navbar: NavbarActions,
    notification: NotificationActions,
    onboarding: OnboardingActions,
    onHold: OnHoldActions,
    popup: PopupActions,
    resource: ResourceActions,
    role: RoleActions,
    scheduler: SchedulerActions,
    script: ScriptActions,
    searchbox: SearchBoxActions,
    session: SessionActions,
    settingsMenu: SettingsMenuActions,
    groups: GroupsActions,
    tabs: TabsActions,
    task: TaskActions,
    token: TokenActions,
    user: UserActions,
    workflow: WorkflowActions,
  }
}
