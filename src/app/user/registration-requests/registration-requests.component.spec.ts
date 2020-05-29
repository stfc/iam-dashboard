import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RegistrationRequestsComponent } from './registration-requests.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { REGISTRATION_REQUESTS } from 'src/app/utils/test-data';
import { RegistrationService } from '../registration/registration.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RealmService } from 'src/app/services/realm.service';
import { MatTableDataSource } from '@angular/material/table';
import { UpdateableTableService } from 'src/app/services/updateable-table.service';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificationsService } from 'angular2-notifications';

describe('RegistrationRequestsComponent', () => {
  let component: RegistrationRequestsComponent;
  let fixture: ComponentFixture<RegistrationRequestsComponent>;
  let registrationService;
  let realmService;
  let sb;
  let dialog;
  let updateableTableService;
  const subject = new Subject();
  let notificationsService;

  beforeEach(async(() => {
    registrationService = jasmine.createSpyObj(['getPaginated', 'actionRegistrationRequest']);
    registrationService.getPaginated.and.returnValue(of(
      REGISTRATION_REQUESTS
    ));

    subject.next({
      resources: REGISTRATION_REQUESTS.resources,
      dataSource: new MatTableDataSource(REGISTRATION_REQUESTS.resources)
    });

    updateableTableService = jasmine.createSpyObj(['getNext']);
    updateableTableService.getNext.and.returnValue(subject);

    realmService = jasmine.createSpyObj(['getCurrentRealm']);

    realmService.getCurrentRealm.and.returnValue(of('alice'));

    sb = jasmine.createSpyObj(['open']);
    notificationsService = jasmine.createSpyObj(['create']);

    dialog = jasmine.createSpyObj('dialog', ['open', 'afterClosed']);

    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        MatButtonModule,
        MatDialogModule
      ],
      declarations: [ RegistrationRequestsComponent ],
      providers: [
        MatSnackBar,
        { provide: RegistrationService, useValue: registrationService },
        { provide: RealmService, useValue: realmService },
        { provide: MatSnackBar, useValue: sb },
        { provide: MatDialog, useValue: dialog },
        { provide: UpdateableTableService, useValue: updateableTableService },
        { provide: NotificationsService, useValue: notificationsService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should action accept and reject request', () => {
    const dialogRef = jasmine.createSpyObj(['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true));
    dialog.open.and.returnValue(dialogRef);

    registrationService.actionRegistrationRequest.and.returnValue(of({}));

    component.actionRequest('id', 'accept');
    expect(dialog.open).toHaveBeenCalled();
    expect(dialogRef.afterClosed).toHaveBeenCalled();
    expect(sb.open).toHaveBeenCalled();

    registrationService.actionRegistrationRequest.and.returnValue(throwError({status: 500}));

    component.actionRequest('id', 'accept');
    expect(dialog.open).toHaveBeenCalled();
    expect(dialogRef.afterClosed).toHaveBeenCalled();
    expect(sb.open).toHaveBeenCalled();

    registrationService.actionRegistrationRequest.and.returnValue(of({}));

    component.actionRequest('id', 'reject');
    expect(dialog.open).toHaveBeenCalled();
    expect(dialogRef.afterClosed).toHaveBeenCalled();
    expect(sb.open).toHaveBeenCalled();
  });

  it('should not do anything when dialog closed', () => {
    const dialogRef = jasmine.createSpyObj(['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(false));
    dialog.open.and.returnValue(dialogRef);
    component.actionRequest('id', 'reject');
    expect(sb.open).not.toHaveBeenCalled();
  });

  it('should update table on page change event', fakeAsync(() => {
    component.registrationRequests = [];
    subject.next({
      resources: REGISTRATION_REQUESTS.resources,
      dataSource: new MatTableDataSource(REGISTRATION_REQUESTS.resources)
    });
    component.getNext({pageSize: 10, pageIndex: 10, length: 10});
    tick();
    expect(component.registrationRequests).toEqual(REGISTRATION_REQUESTS.resources);
  }));

  it('should not update table on page change event with http error', fakeAsync(() => {
    const sub2 = new Subject();
    sub2.next({resources: undefined, dataSource: undefined});
    component.registrationRequests = [];
    updateableTableService.getNext.and.returnValue(sub2);
    component.getNext({pageSize: 10, pageIndex: 10, length: 10});
    tick();
    expect(component.registrationRequests).toEqual([]);
  }));

  it('should not action a 0 selection of requests', () => {
    component.actionSelected('approve');
    expect(sb.open).toHaveBeenCalled();
  });

  it('should action a selection of requests', () => {
    const dialogRef = jasmine.createSpyObj(['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of({confirm: true, userInput: 'a'}));
    dialog.open.and.returnValue(dialogRef);
    registrationService.actionRegistrationRequest.and.returnValue(of({}));

    component.selection = new SelectionModel(true, REGISTRATION_REQUESTS.resources);
    component.actionSelected('approve');
    component.actionSelected('reject');
    expect(sb.open).not.toHaveBeenCalled();
    expect(notificationsService.create).toHaveBeenCalled();
  });

  it('should try but fail action with server error', () => {
    const dialogRef = jasmine.createSpyObj(['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of({confirm: true, userInput: 'a'}));
    dialog.open.and.returnValue(dialogRef);
    registrationService.actionRegistrationRequest.and.returnValue(throwError({status: 500}));

    component.selection = new SelectionModel(true, REGISTRATION_REQUESTS.resources);
    component.actionSelected('approve');
    component.actionSelected('reject');
    expect(sb.open).toHaveBeenCalled();
  });
});
