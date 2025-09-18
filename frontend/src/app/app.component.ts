import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from } from 'rxjs';
import { concatMap, delay, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  numEmployees: number = 5;
  numFiles: number = 1;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // private apiUrl = 'http://localhost:3000/generate-excel';
  private apiUrl = 'https://generateexcel.onrender.com/generate-excel';

  constructor(private http: HttpClient) {}

generateAndDownload(): void {
  if (this.numEmployees <= 0 || this.numFiles <= 0) {
    this.errorMessage = "Please enter a positive number for employees and files.";
    return;
  }
  if (this.numFiles > 5) {
    this.errorMessage = "You can generate a maximum of 5 files at a time.";
    return;
  }

  this.isLoading = true;
  this.errorMessage = null;
  const payload = { numEmployees: this.numEmployees };

  const fileRequests = Array.from({ length: this.numFiles }, (_, i) => i + 1);

  from(fileRequests)
    .pipe(
      concatMap(fileNumber =>
        // The inner pipe now correctly uses tap
        this.http.post(this.apiUrl, payload, { responseType: 'blob' }).pipe(
          delay(500),
          // tap performs the download action and passes the observable along
          tap(blob => this.downloadFile(blob, fileNumber))
        )
      ),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      // The main subscription handles errors
      error: err => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred during file generation. Please try again.';
        console.error(err);
      }
    });
}
  private downloadFile(blob: Blob, fileNumber: number): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_data_${fileNumber}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}