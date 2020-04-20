import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Routes } from '@angular/router';
import { AppAuthGuard } from './app.authguard';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';
import { RegistrationRequestsComponent } from './registration-requests/registration-requests.component';
import { PermissionDeniedComponent } from './permission-denied/permission-denied.component';

const routes: Routes = [
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '403',
    component: PermissionDeniedComponent
  },
  {
    path: ':realm',
    component: LoginComponent
  },
  {
    path: ':realm/register',
    component: RegistrationComponent
  },
  {
    path: ':realm/register/confirm/:token',
    component: EmailConfirmationComponent
  },
  {
    path: ':realm/dashboard/requests/registration',
    component: RegistrationRequestsComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AppAuthGuard]
})
export class AppRoutingModule {}
