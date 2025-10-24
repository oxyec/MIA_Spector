from locust import HttpUser, task, between

'''
    压力测试
'''

API_KEY = "abc123"

class MIAUser(HttpUser):
    wait_time = between(0.5, 2.0)

    @task(2)
    def healthz(self):
        self.client.get("/healthz", headers={"Authorization": f"Bearer {API_KEY}"})

    @task(1)
    def get_configs(self):
        self.client.get("/v1/configs", headers={"Authorization": f"Bearer {API_KEY}"})

    @task(1)
    def decide_once(self):
        payload = {
            "text": "The mitochondrion is the powerhouse of the cell.",
            "family": "pythia",
            "model": "pythia-410m",
            "cfg": "WikiMIA_length128",
            "metric_group": "mink++",
            "subkey": 0.3,
            "mode": "bestJ",
            "abstain_margin": 0.1
        }
        self.client.post("/v1/decide",
                         headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
                         json=payload)
