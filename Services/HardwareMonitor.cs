namespace ari_final_sa_capstone.Services
{
    public static class HardwareMonitor
    {
        public static bool IsConnected { get; set; } = false;
        public static string StatusMessage { get; set; } = "Initializing...";
        public static int SignalStrength { get; set; } = 0;
        public static string PortName { get; set; } = "COM9";
    }
}
