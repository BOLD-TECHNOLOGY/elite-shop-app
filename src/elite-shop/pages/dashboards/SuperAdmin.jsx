import SuperAdminLayout from '../layout/_role-based/SuperAdminLayout';
import { BarChart3, Users, Building2, FileText } from 'lucide-react';


export default function SuperAdmin() {

const dashboardCards = [
    {
        title: 'Authorized Users',
        value: '10',
        icon: BarChart3,
        color: 'bg-blue-50 text-blue-600',
        bgColor: 'bg-blue-500'
    },
    {
        title: 'Reported Cases',
        value: '43',
        icon: FileText,
        color: 'bg-green-50 text-green-600',
        bgColor: 'bg-green-500'
    },
    {
        title: 'Total Agencies',
        value: '10',
        icon: Building2,
        color: 'bg-purple-50 text-purple-600',
        bgColor: 'bg-purple-500'
    },
    {
        title: 'Total Visitors',
        value: '157',
        icon: Users,
        color: 'bg-orange-50 text-orange-600',
        bgColor: 'bg-orange-500'
    }
];

    return (
        <SuperAdminLayout pageTitle="Admin Dashboard">
            <div className="dashboard dashboard-grid">
                {dashboardCards.map((card, index) => (
                    <div key={index} className="dashboard dashboard-card">
                        <div className="dashboard card-content">
                            <div className="dashboard card-info">
                                <h3>{card.title}</h3>
                                <p className="dashboard card-value">{card.value}</p>
                            </div>
                            <div className={`dashboard card-icon ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SuperAdminLayout>
    );
}