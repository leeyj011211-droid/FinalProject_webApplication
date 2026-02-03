package com.project1.backend_spring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AnalysisResultDTO {
    
    // 1. 기기 시리얼 번호 (JSON key: "serial_no")
    @JsonProperty("serial_no")
    private String serialNo;
    
    // 2. 위반 결과 (예: "중앙선침범 (car)")
    private String result;     
    
    // 3. 차량 번호 (예: "12가3456")
    private String plate;      
    
    // 4. 위치 정보
    private String location;   
    
    // 5. 발생 시간 (파이썬에서 "YYYY-MM-DD HH:MM:SS" 문자열로 옴)
    private String time;       
    
    // 6. 영상 URL (JSON key: "video_url")
    @JsonProperty("video_url")
    private String videoUrl;   
    
    // 7. AI 신뢰도/확률
    private double prob;       

    // ==========================================
    // Getters and Setters
    // ==========================================
    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public double getProb() { return prob; }
    public void setProb(double prob) { this.prob = prob; }
}