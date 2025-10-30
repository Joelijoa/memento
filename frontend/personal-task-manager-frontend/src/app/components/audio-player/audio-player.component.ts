import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss'
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  @Input() audioUrl: string = '';
  @Input() fileName: string = '';

  audio: HTMLAudioElement | null = null;
  isPlaying = false;
  isPaused = false;
  isLoading = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 1;
  isMuted = false;

  private progressInterval: any;

  ngOnInit() {
    if (this.audioUrl) {
      this.initializeAudio();
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeAudio() {
    this.audio = new Audio(this.audioUrl);
    this.isLoading = true;

    this.audio.addEventListener('loadedmetadata', () => {
      const d = this.audio!.duration;
      this.duration = Number.isFinite(d) && d > 0 ? d : 0;
      this.isLoading = false;
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio!.currentTime;
      this.progress = (this.duration && isFinite(this.duration) && this.duration > 0)
        ? (this.currentTime / this.duration) * 100
        : 0;
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentTime = 0;
      this.progress = 0;
      this.stopProgressTracking();
    });

    this.audio.addEventListener('error', () => {
      this.isLoading = false;
      console.error('Erreur lors du chargement de l\'audio');
    });
  }

  togglePlayPause() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.audio) return;

    this.audio.play().then(() => {
      this.isPlaying = true;
      this.isPaused = false;
      this.startProgressTracking();
    }).catch(error => {
      console.error('Erreur lors de la lecture:', error);
    });
  }

  pause() {
    if (!this.audio) return;

    this.audio.pause();
    this.isPlaying = false;
    this.isPaused = true;
    this.stopProgressTracking();
  }

  stop() {
    if (!this.audio) return;

    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.progress = 0;
    this.stopProgressTracking();
  }

  seek(event: any) {
    if (!this.audio) return;

    if (!this.duration || !isFinite(this.duration) || this.duration <= 0) return;

    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * this.duration;
    
    this.audio.currentTime = newTime;
    this.currentTime = newTime;
    this.progress = (newTime / this.duration) * 100;
  }

  toggleMute() {
    if (!this.audio) return;

    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
  }

  setVolume(event: any) {
    if (!this.audio) return;

    const volume = parseFloat(event.target.value);
    this.volume = volume;
    this.audio.volume = volume;
  }

  private startProgressTracking() {
    this.progressInterval = setInterval(() => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime;
        this.progress = (this.duration && isFinite(this.duration) && this.duration > 0)
          ? (this.currentTime / this.duration) * 100
          : 0;
      }
    }, 100);
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private cleanup() {
    this.stopProgressTracking();
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds) || seconds <= 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
