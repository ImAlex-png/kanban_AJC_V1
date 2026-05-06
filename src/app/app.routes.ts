import { Routes } from '@angular/router';
import { Board } from './componentes/tabla/board';
import { Dashboard } from './componentes/dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'board/:id', component: Board },
    { path: 'usuarios', loadComponent: () => import('./componentes/CRUD-usuario/user-management.component').then(m => m.UserManagementComponent) },
    { path: '**', redirectTo: '' },
];
