import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MobileService } from '../../services/mobile.service';

@Component({
  selector: 'app-audio-recorder',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './audio-recorder.component.html',
  styleUrl: './audio-recorder.component.scss'
})
export class AudioRecorderComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Output() audioRecorded = new EventEmitter<Blob>();
  @Output() recordingCancelled = new EventEmitter<void>();

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  isRecording = false;
  isPaused = false;
  recordingTime = 0;
  recordingDuration = '00:00';
  private recordingInterval: any;
  isMobile = false;

  constructor(private mobileService: MobileService) {}

  ngOnInit() {
    this.isMobile = this.mobileService.isMobile();
    this.checkMicrophonePermission();
  }

  ngOnDestroy() {
    this.stopRecording();
    this.cleanup();
  }

  async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      alert('L\'accès au microphone est nécessaire pour l\'enregistrement vocal.');
    }
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.recordingTime = 0;
      this.isRecording = true;
      this.isPaused = false;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioRecorded.emit(audioBlob);
        this.cleanup();
      };

      this.mediaRecorder.start(100); // Collecte les données toutes les 100ms
      this.startTimer();

    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      alert('Impossible de démarrer l\'enregistrement. Vérifiez les permissions du microphone.');
    }
  }

  pauseRecording() {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.stopTimer();
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.startTimer();
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
      this.stopTimer();
    }
  }

  cancelRecording() {
    this.stopRecording();
    this.recordingCancelled.emit();
    this.cleanup();
  }

  private startTimer() {
    this.recordingInterval = setInterval(() => {
      this.recordingTime++;
      this.updateRecordingDuration();
    }, 1000);
  }

  private stopTimer() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  private updateRecordingDuration() {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    this.recordingDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingTime = 0;
    this.recordingDuration = '00:00';
  }

  get recordingProgress(): number {
    // Progression basée sur le temps (max 5 minutes)
    return Math.min((this.recordingTime / 300) * 100, 100);
  }
}
